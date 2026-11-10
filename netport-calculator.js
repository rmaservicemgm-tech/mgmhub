(() => {
    const ROOT_ID = 'netport-calculator-root';
    let initializationPromise = null;
    let markupPromise = null;
    let calculatorRoot = null;

    const ICONS = {
        'alert-circle': 'fa-exclamation-circle',
        binary: 'fa-calculator',
        'book-open': 'fa-book-open',
        cable: 'fa-plug',
        calculator: 'fa-calculator',
        'check-circle': 'fa-check-circle',
        copy: 'fa-copy',
        download: 'fa-download',
        'file-text': 'fa-file-alt',
        info: 'fa-info-circle',
        'list-ordered': 'fa-list-ol',
        'message-square': 'fa-comment-alt',
        network: 'fa-network-wired',
        'phone-call': 'fa-phone',
        search: 'fa-search',
        'share-2': 'fa-share-alt',
        'shield-check': 'fa-shield-alt',
        sliders: 'fa-sliders-h',
        table: 'fa-table',
        terminal: 'fa-terminal',
        video: 'fa-video',
        wifi: 'fa-wifi',
        zap: 'fa-bolt'
    };

    function refreshIcons() {
        if (!calculatorRoot) return;
        calculatorRoot.querySelectorAll('[data-lucide]').forEach(icon => {
            const iconName = icon.getAttribute('data-lucide');
            icon.removeAttribute('data-lucide');
            icon.classList.add('fas', ICONS[iconName] || 'fa-circle');
        });
    }

    function loadMarkup(root) {
        if (root.dataset.netportMarkupLoaded === 'true') return Promise.resolve();
        if (!markupPromise) {
            markupPromise = fetch(new URL('netport.html', document.baseURI))
                .then(response => {
                    if (!response.ok) throw new Error('Respuesta HTTP ' + response.status + ' al cargar NetPort');
                    return response.text();
                })
                .then(source => {
                    const parsed = new DOMParser().parseFromString(source, 'text/html');
                    const nav = parsed.querySelector('nav');
                    const main = parsed.querySelector('main');
                    const toast = parsed.getElementById('toast-container');
                    if (!nav || !main || !toast) throw new Error('La plantilla NetPort esta incompleta');

                    const navigation = nav.cloneNode(true);
                    navigation.classList.remove('top-16');
                    navigation.classList.add('netport-navigation');
                    const content = document.createElement('div');
                    content.className = main.className + ' netport-content';
                    content.innerHTML = main.innerHTML;
                    const toastContainer = toast.cloneNode(true);
                    root.replaceChildren(toastContainer, navigation, content);

                    root.querySelectorAll('[data-lucide]').forEach(icon => {
                        const iconName = icon.getAttribute('data-lucide');
                        icon.removeAttribute('data-lucide');
                        icon.classList.add('fas', ICONS[iconName] || 'fa-circle');
                    });

                    const handlerNames = [
                        'switchTab', 'exportQuickSummary', 'applyPreset', 'generateSequence',
                        'copyTableText', 'copyNatRules', 'filterPorts', 'filterPortCat',
                        'calculateSubnet', 'checkIpInSubnet', 'generateFullReport',
                        'copyReportWhatsApp', 'copyReportCsv', 'copyToClipboard'
                    ];
                    const handlerPattern = new RegExp('\\b(' + handlerNames.join('|') + ')\\s*\\(', 'g');
                    root.querySelectorAll('[onclick], [oninput], [onchange], [onkeyup]').forEach(element => {
                        ['onclick', 'oninput', 'onchange', 'onkeyup'].forEach(attribute => {
                            if (element.hasAttribute(attribute)) {
                                element.setAttribute(attribute, element.getAttribute(attribute).replace(handlerPattern, (match, name) => 'mgmNetPort.' + name + '('));
                            }
                        });
                    });
                    root.dataset.netportMarkupLoaded = 'true';
                });
        }
        return markupPromise;
    }

    function showLoadError(root) {
        root.replaceChildren();
        const message = document.createElement('div');
        message.className = 'netport-load-error';
        message.setAttribute('role', 'alert');
        message.textContent = 'No se pudo cargar la calculadora. Revisa tu conexion e intentalo de nuevo.';
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.textContent = 'Reintentar';
        retry.addEventListener('click', () => {
            root.dataset.netportMarkupLoaded = 'false';
            markupPromise = null;
            initialize();
        });
        message.appendChild(retry);
        root.appendChild(message);
    }

    function initialize() {
        const root = document.getElementById(ROOT_ID);
        if (!root) return Promise.resolve(false);
        if (root.dataset.netportInitialized === 'true') return Promise.resolve(true);
        if (initializationPromise) return initializationPromise;

        initializationPromise = (async () => {
            try {
                await loadMarkup(root);
                calculatorRoot = root;
                initializeCalculator();
                root.dataset.netportInitialized = 'true';
                return true;
            } catch (error) {
                console.error('[MGM NetPort] No se pudo iniciar la calculadora:', error);
                showLoadError(root);
                return false;
            } finally {
                initializationPromise = null;
            }
        })();
        return initializationPromise;
    }


        // Database of common standard ports
        const PORT_DATABASE = [
            { port: 80, protocol: 'TCP', brand: 'Hikvision / Dahua / Axis', category: 'cctv', name: 'HTTP Web Access', desc: 'Interfaz de usuario Web para configuración e inicio de sesión.', tip: 'Se sugiere cambiar externamente a 8080 o 8000+ por seguridad.' },
            { port: 554, protocol: 'TCP/UDP', brand: 'Hikvision / Dahua / Uniview', category: 'cctv', name: 'RTSP Stream', desc: 'Protocolo de streaming de video HD en tiempo real.', tip: 'Obligatorio para visualizar streams en software VMS o VLC.' },
            { port: 8000, protocol: 'TCP', brand: 'Hikvision', category: 'cctv', name: 'SDK / Server Port', desc: 'Puerto primario de control para apps iVMS-4200 y Hik-Connect.', tip: 'Si el router bloquea este puerto, la app móvil no conectará.' },
            { port: 37777, protocol: 'TCP', brand: 'Dahua', category: 'cctv', name: 'Dahua Private Port', desc: 'Puerto nativo para app DMSS / gDMSS y software SmartPSS.', tip: 'Requerido para conexión directa remota fuera de P2P.' },
            { port: 8100, protocol: 'TCP', brand: 'Uniview', category: 'cctv', name: 'UNV Data Service', desc: 'Comunicación de datos con software EZStation y EZView.', tip: 'Mapear si no se utiliza la nube EZCloud.' },
            { port: 8080, protocol: 'TCP', brand: 'ONVIF / Ubiquiti', category: 'cctv', name: 'ONVIF / UniFi Inform', desc: 'Descubrimiento ONVIF y adopción de APs Ubiquiti.', tip: 'Utilizado por UniFi Controller para adopción Layer 3.' },
            { port: 8443, protocol: 'TCP', brand: 'Ubiquiti UniFi', category: 'networking', name: 'UniFi Web Admin', desc: 'Consola web de gestión del controlador UniFi.', tip: 'Conexión cifrada HTTPS.' },
            { port: 8291, protocol: 'TCP', brand: 'MikroTik', category: 'networking', name: 'Winbox Port', desc: 'Puerto de acceso por software GUI Winbox a RouterOS.', tip: 'Proteger siempre con reglas de firewall o cambiar por puerto alto.' },
            { port: 5060, protocol: 'UDP/TCP', brand: 'VoIP SIP', category: 'telecom', name: 'SIP Protocol', desc: 'Señalización y registro de teléfonos IP y conmutadores PBX.', tip: 'Desactivar SIP ALG en el router para evitar audio unidireccional.' },
            { port: 10000, protocol: 'UDP', brand: 'VoIP RTP', category: 'telecom', name: 'RTP Audio Stream', desc: 'Rango de transmisión de voz en tiempo real (10000-20000).', tip: 'Mapear rango completo si las llamadas sufren de silencio.' },
            { port: 443, protocol: 'TCP', brand: 'Estándar Universal', category: 'services', name: 'HTTPS Seguro', desc: 'Navegación cifrada TLS/SSL para gestión de routers y NVRs.', tip: 'Puerto seguro por defecto.' },
            { port: 53, protocol: 'UDP/TCP', brand: 'Estándar Universal', category: 'services', name: 'DNS Server', desc: 'Resolución de nombres de dominio en la red.', tip: 'Configurar 8.8.8.8 o 1.1.1.1 en NVRs para sincronización cloud.' },
            { port: 123, protocol: 'UDP', brand: 'Estándar Universal', category: 'services', name: 'NTP Time Protocol', desc: 'Sincronización exacta de hora para estampas de agua en grabaciones.', tip: 'Crucial para legalidad de vídeos de seguridad.' }
        ];

        let currentCategory = 'all';

        // Initialize icons and render components on load
        function initializeCalculator() {
            refreshIcons();
            generateSequence();
            renderPortsGrid();
            calculateSubnet();
            generateFullReport();
        };

        // Switch Tabs Function
        function switchTab(tabId) {
            document.querySelectorAll('#netport-calculator-root .tab-content').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('#netport-calculator-root .tab-btn').forEach(btn => {
                btn.classList.remove('bg-slate-800', 'text-cyan-400', 'border', 'border-slate-700');
                btn.classList.add('text-slate-400');
            });

            document.getElementById('tab-' + tabId).classList.remove('hidden');
            const activeBtn = document.getElementById('tab-btn-' + tabId);
            activeBtn.classList.add('bg-slate-800', 'text-cyan-400', 'border', 'border-slate-700');
            activeBtn.classList.remove('text-slate-400');
        }

        // Apply Brand Presets
        function applyPreset(brand) {
            if (brand === 'hikvision') {
                document.getElementById('chk-http').checked = true;
                document.getElementById('port-http-int').value = 80;
                document.getElementById('port-http-ext').value = 8080;

                document.getElementById('chk-rtsp').checked = true;
                document.getElementById('port-rtsp-int').value = 554;
                document.getElementById('port-rtsp-ext').value = 8554;

                document.getElementById('chk-sdk').checked = true;
                document.getElementById('port-sdk-int').value = 8000;
                document.getElementById('port-sdk-ext').value = 9000;
                document.getElementById('seq-name-prefix').value = 'CAM-HIK-';
                showToast("Preset Hikvision aplicado");
            } else if (brand === 'dahua') {
                document.getElementById('chk-http').checked = true;
                document.getElementById('port-http-int').value = 80;
                document.getElementById('port-http-ext').value = 8081;

                document.getElementById('chk-rtsp').checked = true;
                document.getElementById('port-rtsp-int').value = 554;
                document.getElementById('port-rtsp-ext').value = 8555;

                document.getElementById('chk-sdk').checked = true;
                document.getElementById('port-sdk-int').value = 37777;
                document.getElementById('port-sdk-ext').value = 37777;
                document.getElementById('seq-name-prefix').value = 'CAM-DAHUA-';
                showToast("Preset Dahua aplicado");
            } else if (brand === 'uniview') {
                document.getElementById('chk-http').checked = true;
                document.getElementById('port-http-int').value = 80;
                document.getElementById('port-http-ext').value = 8082;

                document.getElementById('chk-rtsp').checked = true;
                document.getElementById('port-rtsp-int').value = 554;
                document.getElementById('port-rtsp-ext').value = 8556;

                document.getElementById('chk-sdk').checked = true;
                document.getElementById('port-sdk-int').value = 8100;
                document.getElementById('port-sdk-ext').value = 9100;
                document.getElementById('seq-name-prefix').value = 'CAM-UNV-';
                showToast("Preset Uniview aplicado");
            } else if (brand === 'ubiquiti') {
                document.getElementById('chk-http').checked = true;
                document.getElementById('port-http-int').value = 80;
                document.getElementById('port-http-ext').value = 8080;

                document.getElementById('chk-rtsp').checked = false;

                document.getElementById('chk-sdk').checked = true;
                document.getElementById('port-sdk-int').value = 8443;
                document.getElementById('port-sdk-ext').value = 8443;
                document.getElementById('seq-name-prefix').value = 'AP-UNIFI-';
                showToast("Preset Ubiquiti UniFi aplicado");
            } else if (brand === 'voip') {
                document.getElementById('chk-http').checked = true;
                document.getElementById('port-http-int').value = 80;
                document.getElementById('port-http-ext').value = 8090;

                document.getElementById('chk-rtsp').checked = true;
                document.getElementById('port-rtsp-int').value = 5060;
                document.getElementById('port-rtsp-ext').value = 5060;

                document.getElementById('chk-sdk').checked = true;
                document.getElementById('port-sdk-int').value = 10000;
                document.getElementById('port-sdk-ext').value = 10000;
                document.getElementById('seq-name-prefix').value = 'VOIP-TEL-';
                showToast("Preset VoIP aplicado");
            }
            generateSequence();
        }

        // Helper: Convert IPv4 String to Integer
        function ipToInt(ip) {
            return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
        }

        // Helper: Convert Integer to IPv4 String
        function intToIp(int) {
            return [
                (int >>> 24) & 255,
                (int >>> 16) & 255,
                (int >>> 8) & 255,
                int & 255
            ].join('.');
        }

        // Generate IP Sequence and Table Logic
        function generateSequence() {
            const startIpStr = document.getElementById('seq-start-ip').value.trim();
            const count = parseInt(document.getElementById('seq-count').value, 10) || 1;
            const prefix = document.getElementById('seq-name-prefix').value.trim() || 'DEV-';
            const mode = document.getElementById('seq-port-mode').value;

            const useHttp = document.getElementById('chk-http').checked;
            const httpInt = parseInt(document.getElementById('port-http-int').value, 10) || 80;
            const httpExtBase = parseInt(document.getElementById('port-http-ext').value, 10) || 8080;

            const useRtsp = document.getElementById('chk-rtsp').checked;
            const rtspInt = parseInt(document.getElementById('port-rtsp-int').value, 10) || 554;
            const rtspExtBase = parseInt(document.getElementById('port-rtsp-ext').value, 10) || 8554;

            const useSdk = document.getElementById('chk-sdk').checked;
            const sdkInt = parseInt(document.getElementById('port-sdk-int').value, 10) || 8000;
            const sdkExtBase = parseInt(document.getElementById('port-sdk-ext').value, 10) || 9000;

            const startInt = ipToInt(startIpStr);
            if (isNaN(startInt) || startIpStr.split('.').length !== 4) {
                document.getElementById('seq-table-body').innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-400">Dirección IP inicial no válida.</td></tr>`;
                return;
            }

            let tbodyHtml = '';
            let natRulesList = [];

            for (let i = 0; i < count; i++) {
                const currentIpInt = startInt + i;
                const currentIp = intToIp(currentIpInt);
                const devName = `${prefix}${String(i + 1).padStart(2, '0')}`;

                const httpExt = mode === 'incremental' ? httpExtBase + i : httpExtBase;
                const rtspExt = mode === 'incremental' ? rtspExtBase + i : rtspExtBase;
                const sdkExt = mode === 'incremental' ? sdkExtBase + i : sdkExtBase;

                let portsSummaryArr = [];
                if (useHttp) portsSummaryArr.push(`HTTP: ${httpInt}→<span class="text-emerald-400 font-bold">${httpExt}</span>`);
                if (useRtsp) portsSummaryArr.push(`RTSP: ${rtspInt}→<span class="text-emerald-400 font-bold">${rtspExt}</span>`);
                if (useSdk) portsSummaryArr.push(`SDK: ${sdkInt}→<span class="text-emerald-400 font-bold">${sdkExt}</span>`);

                tbodyHtml += `
                    <tr class="hover:bg-slate-800/50 transition">
                        <td class="p-2 text-slate-500">${i + 1}</td>
                        <td class="p-2 font-bold text-slate-200">${devName}</td>
                        <td class="p-2 text-cyan-300 font-semibold">${currentIp}</td>
                        <td class="p-2 text-[11px] text-slate-300">${portsSummaryArr.join(' | ')}</td>
                        <td class="p-2 text-right">
                            <button onclick="mgmNetPort.copyToClipboard('${currentIp}')" title="Copiar IP" class="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition">
                                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                            </button>
                        </td>
                    </tr>
                `;

                // NAT script generation
                const format = document.getElementById('nat-script-format').value;
                if (format === 'mikrotik') {
                    if (useHttp) natRulesList.push(`/ip firewall nat add chain=dstnat protocol=tcp dst-port=${httpExt} action=dst-nat to-addresses=${currentIp} to-ports=${httpInt} comment="${devName} HTTP"`);
                    if (useRtsp) natRulesList.push(`/ip firewall nat add chain=dstnat protocol=tcp dst-port=${rtspExt} action=dst-nat to-addresses=${currentIp} to-ports=${rtspInt} comment="${devName} RTSP"`);
                    if (useSdk) natRulesList.push(`/ip firewall nat add chain=dstnat protocol=tcp dst-port=${sdkExt} action=dst-nat to-addresses=${currentIp} to-ports=${sdkInt} comment="${devName} SDK"`);
                } else {
                    natRulesList.push(`${devName} (${currentIp}) -> WAN ${useHttp ? 'HTTP:' + httpExt : ''} ${useRtsp ? 'RTSP:' + rtspExt : ''} ${useSdk ? 'SDK:' + sdkExt : ''}`);
                }
            }

            document.getElementById('seq-table-body').innerHTML = tbodyHtml;
            document.getElementById('nat-rules-output').value = natRulesList.join('\n');
            refreshIcons();
            generateFullReport();
        }

        // Copy Table Summary as plain text
        function copyTableText() {
            const rows = document.querySelectorAll('#seq-table-body tr');
            let text = "DISPOSITIVO\tIP LOCAL\tPUERTOS\n";
            rows.forEach(r => {
                const cols = r.querySelectorAll('td');
                if (cols.length >= 4) {
                    text += `${cols[1].innerText}\t${cols[2].innerText}\t${cols[3].innerText}\n`;
                }
            });
            copyToClipboard(text);
        }

        // Copy NAT Rules
        function copyNatRules() {
            const text = document.getElementById('nat-rules-output').value;
            copyToClipboard(text);
        }

        // Render Port Cards
        function renderPortsGrid() {
            const search = (document.getElementById('port-search-input')?.value || '').toLowerCase();
            const grid = document.getElementById('ports-grid');

            const filtered = PORT_DATABASE.filter(p => {
                const matchCat = currentCategory === 'all' || p.category === currentCategory;
                const matchSearch = p.name.toLowerCase().includes(search) || 
                                    p.brand.toLowerCase().includes(search) || 
                                    p.port.toString().includes(search) ||
                                    p.desc.toLowerCase().includes(search);
                return matchCat && matchSearch;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `<div class="col-span-full py-8 text-center text-slate-500 text-xs">No se encontraron puertos con ese criterio de búsqueda.</div>`;
                return;
            }

            grid.innerHTML = filtered.map(p => `
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 border border-cyan-800/60 px-2 py-0.5 rounded">
                                Puerto ${p.port} / ${p.protocol}
                            </span>
                            <span class="text-[10px] text-slate-400 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                ${p.brand}
                            </span>
                        </div>
                        <h4 class="text-sm font-bold text-white mb-1">${p.name}</h4>
                        <p class="text-xs text-slate-400 mb-3">${p.desc}</p>
                    </div>
                    <div class="pt-2 border-t border-slate-900 text-[11px] text-amber-400/90 flex items-start gap-1.5">
                        <i data-lucide="info" class="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400"></i>
                        <span>${p.tip}</span>
                    </div>
                </div>
            `).join('');

            refreshIcons();
        }

        function filterPorts() {
            renderPortsGrid();
        }

        function filterPortCat(cat) {
            currentCategory = cat;
            document.querySelectorAll('#netport-calculator-root .port-cat-btn').forEach(b => {
                b.classList.remove('bg-cyan-950', 'text-cyan-400', 'border', 'border-cyan-700/60');
                b.classList.add('bg-slate-800', 'text-slate-300');
            });
            const activeBtn = document.getElementById('btn-cat-' + cat);
            activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
            activeBtn.classList.add('bg-cyan-950', 'text-cyan-400', 'border', 'border-cyan-700/60');
            renderPortsGrid();
        }

        // Subnet Calculator Math
        function calculateSubnet() {
            const ipStr = document.getElementById('calc-ip-input').value.trim();
            const cidr = parseInt(document.getElementById('calc-cidr-select').value, 10);
            const ipInt = ipToInt(ipStr);

            if (isNaN(ipInt) || ipStr.split('.').length !== 4) {
                return;
            }

            const maskInt = cidr === 0 ? 0 : ((0xFFFFFFFF << (32 - cidr)) >>> 0);
            const wildcardInt = (~maskInt) >>> 0;
            const networkInt = (ipInt & maskInt) >>> 0;
            const broadcastInt = (networkInt | wildcardInt) >>> 0;

            const firstUsableInt = cidr >= 31 ? networkInt : networkInt + 1;
            const lastUsableInt = cidr >= 31 ? broadcastInt : broadcastInt - 1;
            const usableCount = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, broadcastInt - networkInt - 1);

            document.getElementById('sub-network-ip').innerText = intToIp(networkInt);
            document.getElementById('sub-gateway-ip').innerText = intToIp(firstUsableInt);
            document.getElementById('sub-mask-dec').innerText = intToIp(maskInt);
            document.getElementById('sub-broadcast-ip').innerText = intToIp(broadcastInt);
            document.getElementById('sub-usable-range').innerText = `${intToIp(firstUsableInt)} - ${intToIp(lastUsableInt)}`;
            document.getElementById('sub-usable-count').innerText = `${usableCount} Dispositivos`;
            document.getElementById('sub-wildcard').innerText = intToIp(wildcardInt);

            checkIpInSubnet();
            generateFullReport();
        }

        // Check if tested IP belongs to active subnet
        function checkIpInSubnet() {
            const ipStr = document.getElementById('calc-ip-input').value.trim();
            const testIpStr = document.getElementById('calc-test-ip').value.trim();
            const cidr = parseInt(document.getElementById('calc-cidr-select').value, 10);

            const ipInt = ipToInt(ipStr);
            const testInt = ipToInt(testIpStr);
            const resultBox = document.getElementById('subnet-test-result');

            if (isNaN(ipInt) || isNaN(testInt)) {
                resultBox.className = "text-xs p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300";
                resultBox.innerText = "Por favor ingresa direcciones IPv4 válidas.";
                return;
            }

            const maskInt = ((0xFFFFFFFF << (32 - cidr)) >>> 0);
            const networkInt = (ipInt & maskInt) >>> 0;
            const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
            const testNetInt = (testInt & maskInt) >>> 0;

            if (testNetInt === networkInt) {
                if (testInt === networkInt) {
                    resultBox.className = "text-xs p-2.5 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 font-medium";
                    resultBox.innerText = `⚠️ La IP ${testIpStr} es la Dirección de RED (Network IP). No asignable a equipos.`;
                } else if (testInt === broadcastInt) {
                    resultBox.className = "text-xs p-2.5 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 font-medium";
                    resultBox.innerText = `⚠️ La IP ${testIpStr} es la Dirección de BROADCAST. No asignable a equipos.`;
                } else {
                    resultBox.className = "text-xs p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-medium";
                    resultBox.innerText = `✅ ¡Correcto! La IP ${testIpStr} PERTENECE a esta subred y es una IP asignable válida.`;
                }
            } else {
                resultBox.className = "text-xs p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 font-medium";
                resultBox.innerText = `❌ La IP ${testIpStr} NO pertenece a esta subred /${cidr}.`;
            }
        }

        // Full Technical Report Generator
        function generateFullReport() {
            const client = document.getElementById('rep-client-name').value || 'Cliente';
            const tech = document.getElementById('rep-tech-name').value || 'Técnico';
            const notes = document.getElementById('rep-notes').value || 'N/A';

            const startIp = document.getElementById('seq-start-ip').value;
            const netIp = document.getElementById('sub-network-ip').innerText;
            const maskDec = document.getElementById('sub-mask-dec').innerText;
            const gateway = document.getElementById('sub-gateway-ip').innerText;
            const cidr = document.getElementById('calc-cidr-select').value;

            const rows = document.querySelectorAll('#seq-table-body tr');
            let devListText = "";
            rows.forEach((r, idx) => {
                const cols = r.querySelectorAll('td');
                if (cols.length >= 4) {
                    devListText += `  🔹 ${cols[1].innerText} -> IP: ${cols[2].innerText} (${cols[3].innerText.replace(/<[^>]*>/g, '')})\n`;
                }
            });

            const reportStr = 
`📋 *FICHA TÉCNICA DE INSTALACIÓN & DIRECCIONAMIENTO IP*
=========================================
🏢 *PROYECTO:* ${client}
👤 *TÉCNICO RESPONSABLE:* ${tech}
📅 *FECHA DE ENTREGA:* ${new Date().toLocaleDateString('es-ES')}

🌐 *PARÁMETROS DE RED LOCAL (LAN):*
  • Red Subred: ${netIp} /${cidr}
  • Máscara de Red: ${maskDec}
  • Puerta de Enlace (Gateway): ${gateway}
  • DNS Recomendados: 8.8.8.8 / 1.1.1.1

📹 *DISPOSITIVOS ASIGNADOS & PUERTOS:*
${devListText}
📝 *NOTAS DE CAMPO:*
  ${notes}

=========================================
NetPort Pro - Suite de Instalaciones`;

            document.getElementById('report-text-output').value = reportStr;
        }

        // Copy functions
        function copyReportWhatsApp() {
            const text = document.getElementById('report-text-output').value;
            copyToClipboard(text);
        }

        function copyReportCsv() {
            const rows = document.querySelectorAll('#seq-table-body tr');
            let csv = "ID,Equipo,IP_Local,Mapeo_Puertos\n";
            rows.forEach(r => {
                const cols = r.querySelectorAll('td');
                if (cols.length >= 4) {
                    csv += `"${cols[0].innerText}","${cols[1].innerText}","${cols[2].innerText}","${cols[3].innerText.replace(/<[^>]*>/g, '')}"\n`;
                }
            });
            copyToClipboard(csv);
        }

        function exportQuickSummary() {
            switchTab('report');
            showToast("Informe listo para copiar");
        }

        // Generic Toast Notification
        function showToast(message, isError = false) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-xl transition duration-300 transform translate-y-2 opacity-0 ${
                isError ? 'bg-red-600 text-white' : 'bg-emerald-500 text-slate-950'
            }`;
            toast.innerHTML = `<i data-lucide="${isError ? 'alert-circle' : 'check-circle'}" class="w-4 h-4"></i> ${message}`;
            container.appendChild(toast);
            refreshIcons();

            setTimeout(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            }, 10);

            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }, 2500);
        }

        // Robust Copy to Clipboard supporting frames
        function copyToClipboard(text) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast("¡Copiado al portapapeles!");
                }).catch(() => {
                    fallbackCopy(text);
                });
            } else {
                fallbackCopy(text);
            }
        }

        function fallbackCopy(text) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                showToast("¡Copiado al portapapeles!");
            } catch (err) {
                showToast("Error al copiar texto", true);
            }
            document.body.removeChild(textArea);
        }
    
    window.mgmNetPort = {
        initialize,
        switchTab,
        applyPreset,
        generateSequence,
        copyTableText,
        copyNatRules,
        renderPortsGrid,
        filterPorts,
        filterPortCat,
        calculateSubnet,
        checkIpInSubnet,
        generateFullReport,
        copyReportWhatsApp,
        copyReportCsv,
        exportQuickSummary,
        showToast,
        copyToClipboard,
        fallbackCopy
    };
})();
