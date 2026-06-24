/**
 * [FILE] fx.js
 * [POS] 高级动效层引擎 - 光标光效/粒子拖尾/WebGL 着色器/磁吸/滚动揭示视差/页面过渡（classic 脚本，file:// 兼容）
 * [IN] DOM（[data-fx-shader]/[data-fx-reveal]/[data-fx-parallax]/[data-fx-count]/.fx-magnetic/内部 .html 链接）
 * [OUT] 注入覆盖层并驱动各动效；给 <html> 加 .fx-ready 启用滚动揭示
 * [DEP] effects.css, base.css（CSS 变量与品牌色）
 * [SIDE EFFECT] 修改 DOM（注入 canvas/div/遮罩）、绑定全局事件、rAF 循环、sessionStorage 标记
 * [TEST] 手动测试: 本地服务器或 file:// 打开 index.html/task-hall.html，核对各动效与降级
 *
 * FX Engine (classic IIFE, no modules, no dependencies)
 * ============================================ */

(function () {
    'use strict';

    // 防止重复初始化
    if (window.__fxInit) return;
    window.__fxInit = true;

    // ============================================
    // 环境检测 / 降级开关
    // ============================================
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isCoarse = window.matchMedia('(pointer: coarse)').matches;
    var hasIO = 'IntersectionObserver' in window;
    var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
    var caf = window.cancelAnimationFrame || function (id) { clearTimeout(id); };

    // 仅这两个页面双向接入动效，过渡只在这两者之间触发（避免跳到未接入页面后遮罩不揭开）
    var FX_PAGES = ['index.html', 'task-hall.html'];
    var BRAND_COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4'];

    // ============================================
    // 覆盖层注入
    // ============================================
    function injectOverlays() {
        if (!document.getElementById('fxCursor') && !isCoarse) {
            var cursor = document.createElement('div');
            cursor.id = 'fxCursor';
            document.body.appendChild(cursor);
        }

        if (!document.querySelector('.fx-progress')) {
            var prog = document.createElement('div');
            prog.className = 'fx-progress';
            document.body.appendChild(prog);
        }

        if (!document.querySelector('.fx-transition')) {
            var ov = document.createElement('div');
            ov.className = 'fx-transition';
            ov.setAttribute('aria-hidden', 'true');
            var top = document.createElement('div');
            top.className = 'fx-transition__panel fx-transition__panel--top';
            var bot = document.createElement('div');
            bot.className = 'fx-transition__panel fx-transition__panel--bottom';
            ov.appendChild(top);
            ov.appendChild(bot);
            document.body.appendChild(ov);
        }
    }

    // ============================================
    // CursorFX：光标跟随光晕 + 粒子拖尾
    // ============================================
    var CursorFX = {
        init: function () {
            if (isCoarse) return;
            this.cursor = document.getElementById('fxCursor');
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'fxParticles';
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.maxParticles = 42;
            this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            this.cur = { x: this.mouse.x, y: this.mouse.y };
            this.active = true;

            this.resize();
            window.addEventListener('resize', this);
            window.addEventListener('pointermove', this, { passive: true });
            document.addEventListener('pointerleave', this);

            // 标签页隐藏时暂停（省电）
            var self = this;
            document.addEventListener('visibilitychange', function () {
                self.active = !document.hidden;
                if (self.active && !self.rafId) self.loop();
            });

            this.loop();
        },
        handleEvent: function (e) {
            if (e.type === 'resize') { this.resize(); }
            else if (e.type === 'pointermove') {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
                this.spawn(e.clientX, e.clientY);
            } else if (e.type === 'pointerleave') {
                if (this.cursor) this.cursor.style.opacity = '0';
            }
        },
        resize: function () {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.width = Math.floor(window.innerWidth * dpr);
            this.canvas.height = Math.floor(window.innerHeight * dpr);
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        },
        spawn: function (x, y) {
            if (this.particles.length >= this.maxParticles) this.particles.shift();
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 0.7,
                vy: (Math.random() - 0.5) * 0.7 - 0.25,
                life: 1,
                size: Math.random() * 2.4 + 1,
                color: BRAND_COLORS[(Math.random() * BRAND_COLORS.length) | 0]
            });
        },
        loop: function () {
            var self = CursorFX;
            if (!self.active) { self.rafId = null; return; }
            // 光晕 lerp 跟随
            self.cur.x += (self.mouse.x - self.cur.x) * 0.15;
            self.cur.y += (self.mouse.y - self.cur.y) * 0.15;
            if (self.cursor) {
                self.cursor.style.transform = 'translate(' + self.cur.x + 'px,' + self.cur.y + 'px)';
                if (self.cursor.style.opacity === '0') self.cursor.style.opacity = '';
            }
            // 粒子绘制
            var ctx = self.ctx;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (var i = self.particles.length - 1; i >= 0; i--) {
                var p = self.particles[i];
                p.x += p.vx; p.y += p.vy; p.life -= 0.02;
                p.vx *= 0.98; p.vy *= 0.98;
                if (p.life <= 0) { self.particles.splice(i, 1); continue; }
                ctx.globalAlpha = Math.max(p.life, 0) * 0.7;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life + 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            self.rafId = raf(function () { self.loop(); });
        }
    };

    // ============================================
    // Magnetic：磁吸按钮（自动赋予主 CTA）
    // ============================================
    var Magnetic = {
        STRENGTH: 0.35,
        MAX: 8,
        SEL: '.fx-magnetic, .btn-primary, .btn-white, .btn-view',
        init: function () {
            if (isCoarse) return;
            this.apply();
            var nav = document.querySelector('[data-layout="navbar"]');
            if (nav && window.MutationObserver) {
                var self = this;
                new MutationObserver(function () { self.apply(); })
                    .observe(nav, { childList: true, subtree: true });
            }
        },
        apply: function () {
            var nodes = document.querySelectorAll(this.SEL);
            for (var i = 0; i < nodes.length; i++) {
                var el = nodes[i];
                if (el.dataset.fxMagnetic) continue;
                el.dataset.fxMagnetic = '1';
                el.classList.add('fx-magnetic');
                this.bind(el);
            }
        },
        bind: function (el) {
            var rafId = null;
            el.addEventListener('pointermove', function (e) {
                var r = el.getBoundingClientRect();
                var x = e.clientX - (r.left + r.width / 2);
                var y = e.clientY - (r.top + r.height / 2);
                var tx = x * Magnetic.STRENGTH;
                var ty = y * Magnetic.STRENGTH;
                var mag = Math.hypot(tx, ty);
                if (mag > Magnetic.MAX) { tx = tx / mag * Magnetic.MAX; ty = ty / mag * Magnetic.MAX; }
                if (rafId) caf(rafId);
                rafId = raf(function () {
                    el.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
                });
            });
            el.addEventListener('pointerleave', function () {
                if (rafId) caf(rafId);
                el.style.transform = '';
            });
        }
    };

    // ============================================
    // ScrollFX：滚动揭示 + 视差 + 数字滚动 + 进度条
    // ============================================
    var ScrollFX = {
        init: function () {
            this.progress = document.querySelector('.fx-progress');
            this.parallax = [];
            this.setupStagger();
            this.setupReveal();
            this.setupCount();
            this.setupParallax();
            this.onScroll();
            window.addEventListener('scroll', this, { passive: true });
            window.addEventListener('resize', this, { passive: true });
        },
        handleEvent: function (e) {
            if (e.type === 'scroll' || e.type === 'resize') this.onScroll();
        },
        setupStagger: function () {
            var groups = {};
            var els = document.querySelectorAll('[data-fx-reveal]');
            for (var i = 0; i < els.length; i++) {
                var el = els[i];
                var key = el.parentNode ? el.parentNode : 'root';
                if (!groups[key]) groups[key] = [];
                groups[key].push(el);
            }
            for (var k in groups) {
                if (!groups.hasOwnProperty(k)) continue;
                var arr = groups[k];
                for (var j = 0; j < arr.length; j++) {
                    arr[j].style.setProperty('--fx-delay', Math.min(j * 0.07, 0.5) + 's');
                }
            }
        },
        setupReveal: function () {
            if (!hasIO) {
                // 无 IO 支持：直接全部显示
                var els = document.querySelectorAll('[data-fx-reveal]');
                for (var i = 0; i < els.length; i++) els[i].classList.add('fx-in-view');
                return;
            }
            var io = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    if (entries[i].isIntersecting) {
                        entries[i].target.classList.add('fx-in-view');
                        io.unobserve(entries[i].target);
                    }
                }
            }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
            var els = document.querySelectorAll('[data-fx-reveal]');
            for (var i = 0; i < els.length; i++) io.observe(els[i]);
        },
        setupCount: function () {
            var counts = document.querySelectorAll('[data-fx-count]');
            if (!counts.length) return;
            if (!hasIO) { return; }
            var io = new IntersectionObserver(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    if (!entries[i].isIntersecting) continue;
                    io.unobserve(entries[i].target);
                    ScrollFX.countUp(entries[i].target);
                }
            }, { threshold: 0.5 });
            for (var i = 0; i < counts.length; i++) io.observe(counts[i]);
        },
        countUp: function (el) {
            var target = parseFloat(el.dataset.fxCount);
            if (isNaN(target)) return;
            var suffix = el.dataset.fxSuffix || '';
            if (reduceMotion) { el.textContent = target + suffix; return; }
            var dur = 1400, start = performance.now();
            function tick(now) {
                var t = Math.min((now - start) / dur, 1);
                var eased = 1 - Math.pow(1 - t, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (t < 1) raf(tick); else el.textContent = target + suffix;
            }
            raf(tick);
        },
        setupParallax: function () {
            if (reduceMotion) return;
            var els = document.querySelectorAll('[data-fx-parallax]');
            for (var i = 0; i < els.length; i++) this.parallax.push(els[i]);
        },
        onScroll: function () {
            var st = window.pageYOffset || document.documentElement.scrollTop;
            var h = document.documentElement.scrollHeight - window.innerHeight;
            if (this.progress) {
                var p = h > 0 ? Math.min(st / h, 1) : 0;
                this.progress.style.transform = 'scaleX(' + p + ')';
            }
            if (this.parallax.length) {
                var vh = window.innerHeight;
                for (var i = 0; i < this.parallax.length; i++) {
                    var el = this.parallax[i];
                    var speed = parseFloat(el.dataset.fxParallax) || 0;
                    var r = el.getBoundingClientRect();
                    var offset = (r.top + r.height / 2 - vh / 2);
                    el.style.transform = 'translate3d(0,' + (-offset * speed) + 'px,0)';
                }
            }
        }
    };

    // ============================================
    // Typewriter：标题打字机效果（[data-fx-typewriter]）
    // ============================================
    var Typewriter = {
        init: function () {
            var els = document.querySelectorAll('[data-fx-typewriter]');
            for (var i = 0; i < els.length; i++) this.run(els[i]);
        },
        run: function (el) {
            var full = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (!full) return;
            // 无 JS 动效时直接显示全文（渐进增强：HTML 本就含全文）
            if (reduceMotion) { el.textContent = full; return; }
            var speed = parseInt(el.getAttribute('data-fx-type-speed'), 10) || 80;
            el.textContent = '';
            el.classList.add('fx-typing');
            var i = 0;
            function step() {
                if (i <= full.length) {
                    el.textContent = full.slice(0, i);
                    i++;
                    setTimeout(step, speed);
                } else {
                    // 打字结束后保留光标闪烁片刻再隐藏，避免长期闪烁干扰
                    setTimeout(function () { el.classList.remove('fx-typing'); }, 2200);
                }
            }
            step();
        }
    };

    // ============================================
    // ShaderHero：WebGL 着色器艺术（Hero 背景）
    // ============================================
    var ShaderHero = {
        init: function () {
            var mount = document.querySelector('[data-fx-shader]');
            if (!mount) return;
            var canvas = document.createElement('canvas');
            canvas.className = 'fx-shader-layer';
            mount.insertBefore(canvas, mount.firstChild);

            var gl = null;
            try {
                gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            } catch (err) { gl = null; }
            if (!gl) { canvas.remove(); return; }

            this.canvas = canvas;
            this.gl = gl;
            if (!this.buildProgram()) { canvas.remove(); return; }

            this.mount = mount;
            this.startTime = performance.now();
            this.visible = true;
            this.resize();
            window.addEventListener('resize', this);

            // 离开视口 / 切标签页暂停
            if (hasIO) {
                var self = this;
                this.io = new IntersectionObserver(function (entries) {
                    self.visible = entries[0].isIntersecting;
                    if (self.visible && !document.hidden) self.start(); else self.stop();
                }, { threshold: 0.01 });
                this.io.observe(mount);
            }
            document.addEventListener('visibilitychange', this);

            this.start();
        },
        handleEvent: function (e) {
            if (e.type === 'resize') this.resize();
            else if (e.type === 'visibilitychange') {
                if (document.hidden) this.stop();
                else if (this.visible) this.start();
            }
        },
        buildProgram: function () {
            var gl = this.gl;
            var vs = 'attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos,0.0,1.0); }';
            var fs = [
                'precision mediump float;',
                'uniform vec2 u_res; uniform float u_time;',
                'float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }',
                'float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);',
                '  float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));',
                '  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }',
                'void main(){',
                '  vec2 uv=gl_FragCoord.xy/u_res.xy;',
                '  vec2 p=uv*2.0-1.0; p.x*=u_res.x/u_res.y;',
                '  float t=u_time*0.12;',
                '  float n=noise(p*1.5+vec2(t,t*0.7));',
                '  float n2=noise(p*2.2-vec2(t*0.6,t));',
                '  float m=noise(p*1.0+vec2(-t*0.5,t*0.4));',
                '  vec3 blue=vec3(0.23,0.51,0.96);',
                '  vec3 purple=vec3(0.55,0.36,0.96);',
                '  vec3 cyan=vec3(0.02,0.71,0.83);',
                '  vec3 col=vec3(1.0);',
                '  col=mix(col,blue,smoothstep(0.40,0.90,n)*0.32);',
                '  col=mix(col,purple,smoothstep(0.45,0.95,n2)*0.28);',
                '  col=mix(col,cyan,smoothstep(0.50,1.00,m)*0.22);',
                '  float vig=smoothstep(1.3,0.2,length(p));',
                '  col=mix(vec3(1.0),col,vig*0.92);',
                '  gl_FragColor=vec4(col,1.0);',
                '}'
            ].join('\\n');

            var compile = function (type, src) {
                var s = gl.createShader(type);
                gl.shaderSource(s, src);
                gl.compileShader(s);
                return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
            };
            var vsh = compile(gl.VERTEX_SHADER, vs);
            var fsh = compile(gl.FRAGMENT_SHADER, fs);
            if (!vsh || !fsh) return false;

            var prog = gl.createProgram();
            gl.attachShader(prog, vsh);
            gl.attachShader(prog, fsh);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
            this.prog = prog;

            var buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
            var loc = gl.getAttribLocation(prog, 'a_pos');
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

            this.uTime = gl.getUniformLocation(prog, 'u_time');
            this.uRes = gl.getUniformLocation(prog, 'u_res');
            return true;
        },
        resize: function () {
            var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            var w = this.mount.clientWidth, h = this.mount.clientHeight;
            this.canvas.width = Math.max(1, Math.floor(w * dpr));
            this.canvas.height = Math.max(1, Math.floor(h * dpr));
        },
        start: function () {
            if (this.rafId) return;
            var self = this;
            var loop = function () {
                self.render();
                self.rafId = raf(loop);
            };
            this.rafId = raf(loop);
        },
        stop: function () {
            if (this.rafId) { caf(this.rafId); this.rafId = null; }
        },
        render: function () {
            var gl = this.gl;
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            gl.useProgram(this.prog);
            gl.uniform1f(this.uTime, (performance.now() - this.startTime) / 1000);
            gl.uniform2f(this.uRes, this.canvas.width, this.canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    };

    // ============================================
    // PageTransition：MPA 跨页遮罩过渡（仅 FX_PAGES 之间）
    // ============================================
    var PageTransition = {
        KEY: 'fx-transition-flag',
        init: function () {
            this.overlay = document.querySelector('.fx-transition');
            if (!this.overlay) return;
            // 减少动效偏好：清除标志并完全跳过过渡（避免遮罩闪现）
            if (reduceMotion) {
                sessionStorage.removeItem(this.KEY);
                return;
            }
            this.busy = false;

            // 进入：若带有标志，揭开
            if (sessionStorage.getItem(this.KEY) === 'in') {
                sessionStorage.removeItem(this.KEY);
                this.playEnter();
            }
            // 离开：拦截内部链接
            document.addEventListener('click', this);
            // bfcache 回退时复位
            window.addEventListener('pageshow', function (e) {
                if (e.persisted) PageTransition.reset();
            });
        },
        handleEvent: function (e) {
            if (e.type === 'click') this.onClick(e);
        },
        isFxLink: function (a) {
            if (!a) return false;
            if (a.target && a.target.toLowerCase() === '_blank') return false;
            if (a.hasAttribute('download')) return false;
            var href = a.getAttribute('href');
            if (!href) return false;
            if (href.charAt(0) === '#') return false;
            if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
            var url;
            try { url = new URL(a.href, location.href); } catch (err) { return false; }
            if (url.origin !== location.origin) return false;
            var file = url.pathname.split('/').pop().toLowerCase();
            return FX_PAGES.indexOf(file) !== -1;
        },
        onClick: function (e) {
            if (this.busy) return;
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (e.defaultPrevented) return;
            var a = e.target.closest ? e.target.closest('a') : null;
            if (!a) return;
            if (!this.isFxLink(a)) return;
            if (reduceMotion) return; // 直接默认导航
            e.preventDefault();
            this.navigate(a.href);
        },
        navigate: function (href) {
            this.busy = true;
            sessionStorage.setItem(this.KEY, 'in');
            this.playLeave(function () { window.location.href = href; });
        },
        playLeave: function (done) {
            var called = false;
            var finish = function () { if (called) return; called = true; done && done(); };
            var panels = this.overlay.querySelectorAll('.fx-transition__panel');
            this.overlay.classList.remove('fx-transition--no-transition');
            var self = this;
            raf(function () { self.overlay.classList.add('fx-transition--cover'); });
            if (panels[0]) {
                panels[0].addEventListener('transitionend', function ev(e) {
                    if (e.propertyName !== 'transform') return;
                    panels[0].removeEventListener('transitionend', ev);
                    finish();
                });
            }
            setTimeout(finish, 900); // 兜底
        },
        playEnter: function () {
            var ov = this.overlay;
            ov.classList.add('fx-transition--no-transition', 'fx-transition--cover');
            void ov.offsetWidth; // 强制回流，确保覆盖态生效
            ov.classList.remove('fx-transition--no-transition');
            raf(function () { ov.classList.remove('fx-transition--cover'); });
        },
        reset: function () {
            this.overlay.classList.remove('fx-transition--cover', 'fx-transition--no-transition');
            this.busy = false;
        }
    };

    // ============================================
    // 启动
    // ============================================
    function safe(fn, name) {
        try { fn(); } catch (err) { /* 单个子系统失败不影响其余 */ }
    }

    function boot() {
        // 先启用滚动揭示初态（仅 fx-ready 下隐藏），再做其他
        document.documentElement.classList.add('fx-ready');
        safe(injectOverlays, 'overlays');

        // 滚动揭示优先初始化，确保内容尽快可揭示
        safe(function () { ScrollFX.init(); }, 'scroll');
        safe(function () { Typewriter.init(); }, 'typewriter');
        if (!reduceMotion) {
            safe(function () { ShaderHero.init(); }, 'shader');
            safe(function () { CursorFX.init(); }, 'cursor');
            safe(function () { Magnetic.init(); }, 'magnetic');
        }
        safe(function () { PageTransition.init(); }, 'transition');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
