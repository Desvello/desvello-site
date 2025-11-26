
// Defensive: force-hide lightbox on load (prevents overlay stuck)
document.addEventListener('DOMContentLoaded', ()=>{
  const lb = document.getElementById('lightbox');
  if(lb) lb.hidden = true;
});

document.addEventListener('DOMContentLoaded',()=>{if(window.lucide)lucide.createIcons();document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{const t=a.getAttribute('href'),o=document.querySelector(t);o&&(e.preventDefault(),o.scrollIntoView({behavior:'smooth',block:'start'}),mobileMenu.classList.remove('open'))})});const e=document.querySelector('.nav-toggle');window.mobileMenu=document.getElementById('mobileMenu');e&&e.addEventListener('click',()=>{mobileMenu.classList.toggle('open')})});(function(){const e=new URLSearchParams(window.location.search).get('admin')==='1',t=document.querySelector('.cases-controls'),o=document.getElementById('testimonials'),n=document.getElementById('toggleEdit'),a=document.getElementById('editPanel'),d=document.getElementById('testimonialForm'),l=document.getElementById('tNome'),c=document.getElementById('tCargo'),s=document.getElementById('tTexto'),i=document.getElementById('tIndex'),r=document.getElementById('cancelEdit'),m=document.getElementById('exportTestimonials'),p=document.getElementById('importFile');
  function g(){return[
    {nome:'Luiz',cargo:'Síndico ',texto:'Serviço rápido, atendimento excelente e instalação impecável. A Desvello superou minhas expectativas!'},
    {nome:'Carla',cargo:'Bloco Alpha',texto:'Profissionais de confiança. Resolveram o problema do meu sistema de câmeras no mesmo dia. Recomendo muito!'},
    {nome:'Evaldo Maia',cargo:'Produtor Rural',texto:'Qualidade, organização e preço justo. Meu portão e interfone nunca funcionaram tão bem!'}]
  }function u(){try{return JSON.parse(localStorage.getItem('desvello_testimonials_v1'))||g()}catch(e){return g()}}function h(e){localStorage.setItem('desvello_testimonials_v1',JSON.stringify(e))}function v(){if(!o)return;const e=u();o.innerHTML=e.map((t,n)=>'<div class="card"><p>'+b(t.texto)+'</p><div class="caption">'+b(t.nome+(t.cargo?' — '+t.cargo:''))+'</div>'+(S?'<div class="t-actions" data-i="'+n+'"><button class="btn btn-outline t-edit" type="button">Editar</button><button class="btn t-del" type="button">Excluir</button></div>':'')+'</div>').join('')}function b(e){return e.replace(/[&<>"']/g,(e=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[e])))}const S=e; t&&(t.style.display=S?'':'none'),S&&n&&n.addEventListener('click',(()=>{a.hidden=!a.hidden})),S&&d&&d.addEventListener('submit',(e=>{e.preventDefault();const t=parseInt(i.value,10),n={nome:l.value.trim(),cargo:c.value.trim(),texto:s.value.trim()};if(!n.nome||!n.texto)return;const a=u();t>=0&&t<a.length?a[t]=n:a.push(n),h(a),i.value=-1,d.reset(),v(),alert('Depoimento salvo!')})),S&&r&&r.addEventListener('click',(()=>{i.value=-1,d.reset()})),S&&o&&o.addEventListener('click',(e=>{const t=e.target.closest('button');if(!t)return;const n=t.closest('.t-actions');if(!n)return;const a=parseInt(n.getAttribute('data-i'),10),d=u();if(t.classList.contains('t-edit')){const e=d[a];l.value=e.nome,c.value=e.cargo||'',s.value=e.texto,i.value=a,a.hidden&&(a.hidden=!1),window.scrollTo({top:a.getBoundingClientRect().top+window.scrollY-100,behavior:'smooth'})}else t.classList.contains('t-del')&&confirm('Excluir este depoimento?')&&(d.splice(a,1),h(d),v())})),S&&m&&m.addEventListener('click',(()=>{const e=new Blob([JSON.stringify(u(),null,2)],{type:'application/json'}),t=URL.createObjectURL(e),o=document.createElement('a');o.href=t,o.download='depoimentos.json',o.click(),URL.revokeObjectURL(t)})),S&&p&&p.addEventListener('change',(async()=>{const e=p.files[0];if(!e)return;const t=await e.text();try{const e=JSON.parse(t);Array.isArray(e)?(h(e),v(),alert('Importado com sucesso!')):alert('Arquivo inválido: esperado um array JSON.')}catch(e){alert('Não foi possível ler o JSON.')}p.value=''})),v()})();

// ===== Gallery (filters + service links + lightbox + admin import/export) =====
(function(){
  const adminMode = new URLSearchParams(window.location.search).get('admin') === '1';
  const filters = document.getElementById('galleryFilters');
  const grid = document.getElementById('galleryGrid');
  const exportBtn = document.getElementById('galleryExport');
  const importInput = document.getElementById('galleryImport');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  if(adminMode && exportBtn){ exportBtn.style.display='inline-flex'; }
  if(adminMode && importInput){ importInput.previousElementSibling.style.display='inline-flex'; }

  const DEFAULT_GALLERY = {
    cftv: ['img/portfolio/cftv/1.svg','img/portfolio/cftv/2.svg','img/portfolio/cftv/3.svg'],
    acesso: ['img/portfolio/acesso/1.svg','img/portfolio/acesso/2.svg'],
    automacao: ['img/portfolio/automacao/1.svg','img/portfolio/automacao/2.svg'],
    perimetro: ['img/portfolio/perimetro/1.svg','img/portfolio/perimetro/2.svg'],
    redes: ['img/portfolio/redes/1.svg','img/portfolio/redes/2.svg'],
    interfonia: ['img/portfolio/interfonia/1.svg','img/portfolio/interfonia/2.svg']
  };

  function load(){ try{ return JSON.parse(localStorage.getItem('desvello_gallery_v1')) || DEFAULT_GALLERY; }catch(e){ return DEFAULT_GALLERY; } }
  function save(data){ localStorage.setItem('desvello_gallery_v1', JSON.stringify(data)); }

  function render(cat){
    if(!grid) return;
    const data = load();
    const items = data[cat] || [];
    grid.innerHTML = items.map(src => '<img src="'+src+'" alt="obra" loading="lazy">').join('') || '<div class="hint">Sem imagens para '+cat.toUpperCase()+' ainda.</div>';
    const gal = document.getElementById('galeria'); if(gal) gal.scrollIntoView({behavior:'smooth'});
  }

  // Filters
  if(filters){
    filters.addEventListener('click', (e)=>{
      const btn = e.target.closest('.g-filter'); if(!btn) return;
      const cat = btn.getAttribute('data-filter');
      render(cat);
      filters.querySelectorAll('.g-filter').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  }

  
// From service cards
  document.querySelectorAll('.service-link').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const cat = a.getAttribute('data-service');
      // Se existir o modal de soluções, usa ele
      if (typeof window.openSolutionModal === 'function') {
        e.preventDefault();
        window.openSolutionModal(cat);
        return;
      }
      // Comportamento antigo: leva para a galeria filtrando a categoria
      if(filters){
        filters.querySelectorAll('.g-filter').forEach(b=>b.classList.remove('active'));
        const tgt = filters.querySelector('.g-filter[data-filter="'+cat+'"]');
        if(tgt) tgt.classList.add('active');
      }
      render(cat);
    });
  });

// Lightbox behavior
  if(grid && lightbox){
    grid.addEventListener('click', (e)=>{
      const img = e.target.closest('img'); if(!img) return;
      lightboxImg.src = img.src; if(lightbox) lightbox.hidden = false;
    });
    lightbox.addEventListener('click', ()=>{ if(lightbox) lightbox.hidden = true; });
  }

  // Export/Import
  if(adminMode && exportBtn){
    exportBtn.addEventListener('click', ()=>{
      const blob = new Blob([JSON.stringify(load(), null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'galeria.json'; a.click();
      URL.revokeObjectURL(url);
    });
  }
  if(adminMode && importInput){
    importInput.addEventListener('change', async ()=>{
      const f = importInput.files[0]; if(!f) return;
      try{
        const text = await f.text();
        const data = JSON.parse(text);
        if(data && typeof data === 'object'){ save(data); alert('Galeria importada!'); }
        else alert('JSON inválido.');
      }catch(e){ alert('Falha ao ler o JSON.'); }
      importInput.value='';
    });
  }

  // Default category
  render('cftv');
})();


// ===== Swiper Slider =====
document.addEventListener("DOMContentLoaded", function() {
  if (typeof Swiper !== "undefined") {
    new Swiper(".mySwiper", {
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      speed: 800
    });
  }
});



// ===== Service modal (solutions catalog) =====
(function(){
  const modal = document.getElementById('serviceModal');
  if (!modal) {
    return;
  }

  const overlay    = modal.querySelector('.service-modal__overlay');
  const closeBtn   = document.getElementById('serviceModalClose');
  const titleEl    = document.getElementById('serviceModalTitle');
  const subtitleEl = document.getElementById('serviceModalSubtitle');
  const listEl     = document.getElementById('serviceModalList');
  const imgEl      = document.getElementById('serviceModalImg');
  const itemTitleEl= document.getElementById('serviceModalItemTitle');
  const itemDescEl = document.getElementById('serviceModalItemDesc');
  const featuresEl = document.getElementById('serviceModalItemFeatures');

  // Conteúdo das soluções (pode ajustar textos e imagens depois)
  const DATA = {
    // CFTV: linha IP, analógica WEG e NVR/DVR
cftv: {
  title: 'CFTV profissional',
  subtitle: 'Escolha a categoria de CFTV que você quer visualizar.',
  categories: [
    {
      id: 'cftv-ip',
      label: 'Linha IP WCAM',
      thumb: 'img/portfolio/cftv/ip/11.png',
      subtitle: 'Linha IP WCAM da WEG, com câmeras de 2MP, 4MP e 5MP, além de NVRs para projetos IP completos.',
      items: [
    {
      id: 'ip-h022-b11',
      label: 'WCAM IP-H022-B11 – Bullet 2MP',
      img: 'img/portfolio/cftv/ip/1.png',
      title: 'Câmera WCAM IP-H022-B11',
      desc: 'Bullet IP 2MP Full HD, ideal para áreas externas e fachadas, com instalação simples e alta qualidade de imagem.',
      features: [
        'Resolução Full HD (2MP 1080p)',
        'Compressão H.265/H.264',
        'IR aprox. 30 m para visão noturna',
        'IP66 – proteção contra chuva e poeira'
      ]
    },
    {
      id: 'ip-h022-d11',
      label: 'WCAM IP-H022-D11 – Dome 2MP',
      img: 'img/portfolio/cftv/ip/2.png',
      title: 'Câmera WCAM IP-H022-D11',
      desc: 'Dome IP 2MP para ambientes internos ou externos, com corpo compacto e alta resistência.', 
      features: [
        'Resolução Full HD (2MP 1080p)',
        'Compressão H.265/H.264',
        'IR aprox. 30 m',
        'IP66 – dome protegido para uso externo'
      ]
    },
    {
      id: 'ip-h022-b31',
      label: 'WCAM IP-H022-B31 – Bullet 2MP Night Color',
      img: 'img/portfolio/cftv/ip/3.png',
      title: 'Câmera WCAM IP-H022-B31',
      desc: 'Bullet IP 2MP com tecnologia Night Color, entregando imagens coloridas mesmo em ambientes com pouquíssima luz.',
      features: [
        'Resolução Full HD (2MP)',
        'Tecnologia Night Color (cores à noite)',
        'H.265/H.264 com redução de banda',
        'IP66 – ideal para perímetros e fachadas'
      ]
    },
    {
      id: 'ip-h022-d31',
      label: 'WCAM IP-H022-D31 – Dome 2MP Night Color',
      img: 'img/portfolio/cftv/ip/4.png',
      title: 'Câmera WCAM IP-H022-D31',
      desc: 'Dome IP 2MP Night Color para ambientes internos e externos que precisam de cor mesmo no escuro.',
      features: [
        'Resolução Full HD (2MP)',
        'Night Color com LED branco',
        'IR/LED aprox. 30 m',
        'Grau de proteção IP66'
      ]
    },
    {
      id: 'ip-h042-b71',
      label: 'WCAM IP-H042-B71 – Bullet 4MP',
      img: 'img/portfolio/cftv/ip/5.png',
      title: 'Câmera WCAM IP-H042-B71',
      desc: 'Bullet IP 4MP 2K, com análise inteligente de vídeo e microfone embutido, voltada para projetos mais exigentes.', 
      features: [
        'Resolução QHD 4MP (1440p)',
        'Análises inteligentes de vídeo (IVS)',
        'Microfone integrado para áudio ambiente',
        'IP66 – corpo metálico resistente'
      ]
    },
    {
      id: 'ip-h042-d71',
      label: 'WCAM IP-H042-D71 – Dome 4MP',
      img: 'img/portfolio/cftv/ip/6.png',
      title: 'Câmera WCAM IP-H042-D71',
      desc: 'Dome IP 4MP para aplicações internas/externas com alta definição e robustez.', 
      features: [
        'Resolução 4MP',
        'Lente fixa de 2,8 mm',
        'IR aprox. 30 m',
        'IP66 – resistente a poeira e chuva'
      ]
    },
    {
      id: 'ip-h052-d51',
      label: 'WCAM IP-H052-D51 – Dome 5MP',
      img: 'img/portfolio/cftv/ip/7.png',
      title: 'Câmera WCAM IP-H052-D51',
      desc: 'Dome IP 5MP com gravação local em cartão SD e recursos avançados para áreas críticas.', 
      features: [
        'Resolução 5MP',
        'Suporte a cartão SD',
        'Análises inteligentes de vídeo',
        'IP66 – uso interno ou externo'
      ]
    },
    {
      id: 'ip-m052-b51',
      label: 'WCAM IP-M052-B51 – Bullet 5MP',
      img: 'img/portfolio/cftv/ip/8.png',
      title: 'Câmera WCAM IP-M052-B51',
      desc: 'Bullet IP 5MP com case metálico e proteção elevada, para ambientes externos mais severos.', 
      features: [
        'Resolução 5MP',
        'Case metálico com IP67',
        'Análises de vídeo embarcadas',
        'Instalação indicada para áreas expostas'
      ]
    },
    {
      id: 'ip-m05v-b51',
      label: 'WCAM IP-M05V-B51 – Bullet varifocal 5MP',
      img: 'img/portfolio/cftv/ip/9.png',
      title: 'Câmera WCAM IP-M05V-B51',
      desc: 'Bullet IP 5MP com lente varifocal motorizada, ideal para ajustes finos de enquadramento em portarias e acessos.', 
      features: [
        'Resolução 5MP',
        'Lente varifocal motorizada',
        'IR até 40 m',
        'IP67 – proteção elevada para ambientes externos'
      ]
    },
    {
      id: 'ip-m05v-d51',
      label: 'WCAM IP-M05V-D51 – Dome varifocal 5MP',
      img: 'img/portfolio/cftv/ip/10.png',
      title: 'Câmera WCAM IP-M05V-D51',
      desc: 'Dome IP 5MP com proteção antivandalismo, ideal para halls, garagens e áreas de maior risco.', 
      features: [
        'Resolução 5MP',
        'Lente varifocal com IR de 40 m',
        'Proteção antivandalismo (IK10)',
        'Grau IP66 para ambientes severos'
      ]
    },
    {
      id: 'IP-M02V-S5220',
      label: 'IP-M02V-S5220 - Speed Dome 2MP',
      img: 'img/portfolio/cftv/ip/11.png',
      title: 'Câmera WCAM IP-M02V-S5220',
      desc: 'As câmeras da linha WCAM são indicadas para aplicações que exijam o mais alto nível de monitoramento. Além de contar com zoom óptico de 25x, a Câmera Speed Dome garante a segurança contra descargas e surtos elétricos, bem como analisa as filmagens e reconhece pessoas e veículos.', 
      features: [
        'Resolução Full HD (2MP 1080p)',
        'Alcance Infravermelho (IR) de 200m',
        'Alcance de 360° (infinito) e Zoom óptico de 25x',
        'Análise Inteligente de Vídeo Baseada em Humanos e/ou Veículos',
        'Suporta Cartão Micro SD de até 256 GB (Não Incluso)'
      ]
    }
  ]
    },
{
  id: 'cftv-analogica',
  label: 'Linha analógica WEG',
  thumb: 'img/portfolio/cftv/an/6.png',
  subtitle: 'Linha analógica WCAM da WEG, ideal para projetos com DVR em HD e Full HD.',
  items: [
    {
      id: 'an-p012-b11',
      label: 'WCAM AN-P012-B11 – Bullet HD',
      img: 'img/portfolio/cftv/an/1.png',
      title: 'Câmera WCAM AN-P012-B11',
      desc: 'Bullet analógica HD com carcaça robusta, indicada para áreas externas que precisam de resistência a chuva e poeira.',
      features: [
        'Resolução HD (1MP 720p)',
        'Construção robusta para ambientes externos',
        'Carcaça resistente à chuva e poeira',
        'Boa opção para sistemas DVR econômicos'
      ]
    },
    {
      id: 'an-p012-d11',
      label: 'WCAM AN-P012-D11 – Dome HD',
      img: 'img/portfolio/cftv/an/2.png',
      title: 'Câmera WCAM AN-P012-D11',
      desc: 'Dome analógica HD com redução digital de ruído, indicada para ambientes internos ou cobertos que precisam de boa definição com baixo custo.',
      features: [
        'Resolução HD (1MP 720p)', // :contentReference[oaicite:1]{index=1}
        'Sensor CMOS progressivo com imagem estável', // :contentReference[oaicite:2]{index=2}
        'Tecnologia AHD compatível com DVRs HD', // :contentReference[oaicite:3]{index=3}
        'Redução digital de ruído (DNR) para cenas mais limpas' // :contentReference[oaicite:4]{index=4}
      ]
    },
    {
      id: 'an-p022-b11',
      label: 'WCAM AN-P022-B11 – Bullet Full HD',
      img: 'img/portfolio/cftv/an/3.png',
      title: 'Câmera WCAM AN-P022-B11',
      desc: 'Bullet analógica Full HD com tecnologia que aprimora a definição e filtra excesso de luz, ideal para fachadas e perímetros.',
      features: [
        'Resolução Full HD (2MP 1080p)', // :contentReference[oaicite:5]{index=5}
        'Filtragem de luz para melhor contraste', // :contentReference[oaicite:6]{index=6}
        'Indicada para áreas externas e perímetro',
        'Compatível com DVRs HD de mercado'
      ]
    },
    {
      id: 'an-p022-d11',
      label: 'WCAM AN-P022-D11 – Dome Full HD',
      img: 'img/portfolio/cftv/an/4.png',
      title: 'Câmera WCAM AN-P022-D11',
      desc: 'Dome analógica Full HD com Global Shutter e suporte 4 em 1, para imagens nítidas e compatibilidade com diversos padrões de DVR.',
      features: [
        'Resolução Full HD (2MP 1080p)', // :contentReference[oaicite:7]{index=7}
        'Tecnologia 4 em 1: AHD, HDTVI, HDCVI e CVBS', // :contentReference[oaicite:8]{index=8}
        'Global Shutter — movimentos sem distorções', // :contentReference[oaicite:9]{index=9}
        'IR de aproximadamente 20 m para visão noturna' // :contentReference[oaicite:10]{index=10}
      ]
    },
    {
      id: 'an-m022-d11',
      label: 'WCAM AN-M022-D11 – Dome metálico Full HD',
      img: 'img/portfolio/cftv/an/5.png',
      title: 'Câmera WCAM AN-M022-D11',
      desc: 'Dome analógica Full HD com case metálico e IP66, indicada para locais que exigem mais robustez e durabilidade.',
      features: [
        'Resolução em alta definição (Full HD)', // :contentReference[oaicite:11]{index=11}
        'Case metálico com proteção IP66 contra chuva e poeira', // :contentReference[oaicite:12]{index=12}
        'Aplicação em ambientes internos e externos',
        'Boa opção para condomínios e comércios'
      ]
    },
    {
      id: 'an-m022-b31',
      label: 'WCAM AN-M022-B31 – Bullet Full HD Night Color',
      img: 'img/portfolio/cftv/an/6.png',
      title: 'Câmera WCAM AN-M022-B31',
      desc: 'Bullet analógica Full HD de alto desempenho, com múltiplas configurações e foco em definição de imagem.',
      features: [
        'Resolução Full HD com alta qualidade de imagem', // :contentReference[oaicite:13]{index=13}
        'Quatro possíveis configurações para ajustar a definição', // :contentReference[oaicite:14]{index=14}
        'Indicada para projetos profissionais de CFTV',
        'Compatível com DVRs HD multi-tecnologia'
      ]
    },
    {
      id: 'an-m022-d31',
      label: 'WCAM AN-M022-D31 – Dome Full HD Night Color',
      img: 'img/portfolio/cftv/an/7.png',
      title: 'Câmera WCAM AN-M022-D31',
      desc: 'Dome analógica Full HD com grande redução de ruídos, cores reais e luz suplementar para até 20 m.',
      features: [
        'Resolução Full HD com cores reais', // :contentReference[oaicite:15]{index=15}
        'Tecnologia com forte redução de ruídos digitais', // :contentReference[oaicite:16]{index=16}
        'Luz suplementar em torno de 20 m para cenas noturnas', // :contentReference[oaicite:17]{index=17}
        'Indicada para áreas internas e externas'
      ]
    },
    {
      id: 'an-m02v-b11',
      label: 'WCAM AN-M02V-B11 – Bullet varifocal',
      img: 'img/portfolio/cftv/an/8.png',
      title: 'Câmera WCAM AN-M02V-B11',
      desc: 'Bullet analógica varifocal Full HD, permitindo ampliar a imagem sem distorções e com alcance de até cerca de 45 m em IR.',
      features: [
        'Resolução Full HD (2MP 1080p)', // :contentReference[oaicite:18]{index=18}
        'Lente varifocal manual (~2,8–12 mm)', // :contentReference[oaicite:19]{index=19}
        'Case metálico com proteção IP66', // :contentReference[oaicite:20]{index=20}
        'Compatível com AHD, HDTVI, HDCVI e CVBS' // :contentReference[oaicite:21]{index=21}
      ]
    },
    {
      id: 'an-m02v-d11',
      label: 'WCAM AN-M02V-D11 – Dome varifocal IK10',
      img: 'img/portfolio/cftv/an/9.png',
      title: 'Câmera WCAM AN-M02V-D11',
      desc: 'Dome analógica varifocal Full HD com case metálico, IP66 e proteção antivandalismo IK10, ideal para ambientes críticos.',
      features: [
        'Resolução Full HD (2MP 1080p)', // :contentReference[oaicite:22]{index=22}
        'Lente varifocal manual (2,8–12 mm)', // :contentReference[oaicite:23]{index=23}
        'Proteção IP66 e antivandalismo IK10', // :contentReference[oaicite:24]{index=24}
        'Tecnologia 4 em 1 (AHD, HDTVI, HDCVI, CVBS)' // :contentReference[oaicite:25]{index=25}
      ]
    }
  ]
},

    {
      id: 'cftv-nvr-dvr',
      label: 'NVRs / DVRs WEG',
      thumb: 'img/portfolio/cftv/dvr/5.png',
      subtitle: 'Gravadores digitais e de rede WEG para sistemas IP e analógicos.',
      items: [
        {
          id: 'DV-M04F-131',
          label: 'DVR-M04F-131 – 4 canais',
          img: 'img/portfolio/cftv/dvr/1.png',
          title: 'DVR WCAM DV-M04F-131 - 4 Canais',
          desc: 'DVR compacto de 4 canais para projetos pequenos e médios, compatível com câmeras analógicas HD e Full HD.',
          features: [
        '4 canais HD-TVI/AHD/CVI/CVBS vídeo',
        '1 canal entrada de áudio',
        '2 canais IP vídeo',
        '1 SATA interface – até 4TB',
        'Função NVR'

          ]
        },
         {
      id: 'dvr-h081-08b11',
      label: 'DVR-M08F-131 – 8 canais',
      img: 'img/portfolio/cftv/dvr/2.png',
      title: 'DVR WCAM DV-M08F-131 - 8 Canais',
      desc: 'DVR de 8 canais ideal para condomínios pequenos e lojas, com suporte a múltiplas tecnologias analógicas.',
      features: [
        '8 canais HD-TVI/AHD/CVI/CVBS vídeo',
        '1 canal entrada de áudio',
        '2 canais IP vídeo',
        '1 SATA interface – até 4TB',
        'Função NVR'
      ]
    },
        {
      id: 'dvr-h161-16b11',
      label: 'DVR-M16F-131 – 16 canais',
      img: 'img/portfolio/cftv/dvr/3.png',
      title: 'DVR WCAM DV-M16F-131 - 16 Canais',
      desc: 'DVR de 16 canais para projetos maiores, com suporte a alta resolução e compressão moderna.',
      features: [
        '8 canais HD-TVI/AHD/CVI/CVBS vídeo',
        '1 canal entrada de áudio',
        '2 canais IP vídeo',
        '1 SATA interface – até 4TB',
        'Função NVR'
      ]
    },
        {
      id: 'nNV-M04K-131',
      label: 'NV-M04K-131 IP  – 4 canais',
      img: 'img/portfolio/cftv/dvr/4.png',
      title: 'NV-M04K-131 IP - 4 Canais',
      desc: 'NVR IP para até 4 câmeras, ideal para projetos IP compactos com câmeras de 2MP a 5MP.',
      features: [
        'Suporte a câmeras 2MP/4MP/5MP',
        '4 canais IP vídeo PoE',
        '8MP',
        'H.265/H.264',
        '1 HD SATA – até 8TB',
        'Saída HDMI em 4K'
      ]
    },
       {
      id: 'NV-M08K-131',
      label: 'NV-M08K-131 IP – 8 canais',
      img: 'img/portfolio/cftv/dvr/5.png',
      title: 'NV-M08K-131 IP - 8 Canais',
      desc: 'NVR de 8 canais para projetos IP de médio porte, ideal para condomínios e comércios.',
      features: [
        '8 canais IP vídeo PoE',
        '8MP',
        'H.265/H.264',
        '1 HD SATA – até 8TB',
        'Saída HDMI em 4K',
        '2 USB'
      ]
    },
    {
      id: 'NV-M16K-231',
      label: 'NV-M16K-231 IP – 16 canais',
      img: 'img/portfolio/cftv/dvr/6.png',
      title: 'NV-M16K-231 IP - 16 Canais',
      desc: 'Projetado para alta performance, oferece resolução UHD (4K), 2 interfaces SATA para discos de até 12TB (discos não inclusos) e I/Os de alarme (8 entradas e 2 saídas) . Conta com IA embarcada para detecção de linha e área de intrusão, além de reconhecimento facial, ideal para sistemas inteligentes e robustos.',
      features: [
        '16 canais IP vídeo PoE',
        '8MP',
        'H.265/H.264',
        '2 HD SATA – até 12TB',
        'Saída HDMI em 4K',
        '3 USB'
      ]
    }
      ]
    }
  ]
},

// CONTROLE DE ACESSO: facial, biométrico, proximidade e catraca
    acesso: {
      title: 'Controle de acesso',
      subtitle: 'Controle de acesso facial, biométrico, por proximidade e catracas para portarias modernas.',
      items: [
        {
          id: 'acesso-facial',
          label: 'Controle de acesso facial',
          img: 'img/portfolio/acesso/1.svg',
          title: 'Controle de acesso por reconhecimento facial',
          desc: 'Terminais de reconhecimento facial de alta precisão, ideais para portarias que precisam de agilidade e segurança.',
          features: [
            'Leitura rápida e sem toque (higiene e segurança)',
            'Redução de filas na portaria',
            'Perfeito para moradores, funcionários e prestadores',
            'Integração com portões, fechaduras e catracas'
          ]
        },
        {
          id: 'acesso-biometrico',
          label: 'Controle biométrico (digital)',
          img: 'img/portfolio/acesso/2.svg',
          title: 'Leitores biométricos de digitais',
          desc: 'Leitores biométricos indicados para portas internas, academias, áreas comuns e acessos controlados.',
          features: [
            'Identificação por digital com alta precisão',
            'Memória para vários usuários cadastrados',
            'Controle de horários e níveis de permissão',
            'Uso em portas, clausuras, salas técnicas e mais'
          ]
        },
        {
          id: 'acesso-proximidade',
          label: 'Acesso por proximidade (cartão/tag)',
          img: 'img/portfolio/acesso/3.svg',
          title: 'Cartões e tags de proximidade (RFID)',
          desc: 'Controle de acesso através de cartões ou tags, ideal para visitantes, prestadores e uso diário em áreas comuns.',
          features: [
            'Liberação por cartão, chaveiro ou tag de proximidade',
            'Facilidade para bloquear credenciais perdidas',
            'Perfeito para garagens, portões de pedestre e áreas de lazer',
            'Pode ser combinado com biometria e senha'
          ]
        },
        {
          id: 'acesso-catraca',
          label: 'Catracas de acesso',
          img: 'img/portfolio/acesso/3.svg', // pode trocar por outra imagem específica depois
          title: 'Catracas eletrônicas de acesso',
          desc: 'Catracas integradas ao controle de acesso, ideais para controlar fluxo em recepções, academias e áreas restritas.',
          features: [
            'Controle de passagem com contagem de usuários',
            'Operação integrada (face, biometria, cartão ou senha)',
            'Estrutura robusta para alto fluxo',
            'Relatórios de quem entrou e saiu em cada ponto'
          ]
        }
      ]
    },

    // AUTOMAÇÃO: toda linha WEG de automação
    automacao: {
      title: 'Automação residencial e predial WEG',
      subtitle: 'Toda linha WEG de automação: portões, iluminação, tomadas, relés e cenas inteligentes.',
      items: [
        {
          id: 'automacao-portoes-weg',
          label: 'Automação de portões',
          img: 'img/portfolio/automacao/1.svg',
          title: 'Automação de portões com integração',
          desc: 'Automação de portões deslizantes, basculantes e pivotantes, preparada para integração com controle de acesso e CFTV.',
          features: [
            'Abertura por controle remoto, tag ou aplicativo',
            'Sensores de segurança para evitar acidentes',
            'Integração com fechaduras, clausuras e portaria remota',
            'Ajustes finos de velocidade e força do motor'
          ]
        },
        {
          id: 'weg-home',
          label: 'WEG Home – Casa inteligente',
          img: 'img/portfolio/automacao/2.svg',
          title: 'WEG Home: automação residencial completa',
          desc: 'Interruptores, relés, tomadas e módulos Wi-Fi WEG para automação de iluminação e equipamentos.',
          features: [
            'Controle pelo aplicativo WEG Home',
            'Cenas programadas (chegada, saída, viagem, segurança)',
            'Compatível com assistentes de voz (Alexa/Google, conforme modelo)',
            'Perfeito para iluminação, ventiladores, ar-condicionado e mais'
          ]
        },
        {
          id: 'automacao-condominio',
          label: 'Automação em áreas comuns',
          img: 'img/portfolio/automacao/3.svg',
          title: 'Automação de áreas comuns com linha WEG',
          desc: 'Aplicação da linha WEG de automação em garagens, jardins, halls, fachadas e demais áreas do condomínio.',
          features: [
            'Timers e sensores de presença para economizar energia',
            'Cenas de iluminação em fachadas e jardins',
            'Automação de bombas, portões, exaustores e ventilação',
            'Integração com sistema de segurança e monitoramento'
          ]
        }
      ]
    },

    // ALARME & PERÍMETRO: Intelbras e JFL
    perimetro: {
      title: 'Alarme & perímetro',
      subtitle: 'Soluções Intelbras e JFL para proteção perimetral e alarmes internos.',
      items: [
        {
          id: 'intelbras-alarme',
          label: 'Alarmes Intelbras',
          img: 'img/portfolio/perimetro/1.svg',
          title: 'Sistemas de alarme Intelbras',
          desc: 'Centrais de alarme Intelbras com sensores internos e externos para casas, comércios e condomínios.',
          features: [
            'Centrais com comunicação via IP, Wi-Fi ou GSM (conforme modelo)',
            'Sensores de movimento, abertura e quebra de vidro',
            'Arme e desarme por controle, teclado ou aplicativo',
            'Integração com sirenes, discadoras e monitoramento 24h'
          ]
        },
        {
          id: 'jfl-cerca',
          label: 'Cerca elétrica JFL',
          img: 'img/portfolio/perimetro/2.svg',
          title: 'Cerca elétrica JFL para proteção perimetral',
          desc: 'Centrais de cerca elétrica JFL para proteção de muros, grades e áreas externas do condomínio.',
          features: [
            'Centrais de cerca com alta confiabilidade',
            'Possibilidade de setorização por lado/bloco',
            'Alarme em caso de corte de fio ou aterramento',
            'Integração com sistema de alarme e CFTV'
          ]
        },
        {
          id: 'jfl-barreiras',
          label: 'Barreiras e sensores externos JFL',
          img: 'img/portfolio/perimetro/3.svg',
          title: 'Barreiras e sensores externos JFL',
          desc: 'Sensores externos e barreiras JFL para detecção antecipada em corredores, jardins e estacionamentos.',
          features: [
            'Sensores projetados para área externa',
            'Redução de falsos disparos com tecnologia específica',
            'Cobertura de grandes distâncias em linha de visão',
            'Combinados com cerca elétrica e CFTV reforçam a segurança'
          ]
        }
      ]
    },

    // REDES & INFRAESTRUTURA (mantido como estava)
    redes: {
      title: 'Redes & infraestrutura',
      subtitle: 'Organização, cabeamento e rede preparada para crescer com o condomínio.',
      items: [
        {
          id: 'rack-nobreak',
          label: 'Rack e nobreak',
          img: 'img/portfolio/redes/1.svg',
          title: 'Sala técnica organizada',
          desc: 'Racks padronizados, nobreaks e cabeamento identificado para CFTV e dados.',
          features: [
            'Racks fechados ou abertos',
            'Organização de patch panels e switches',
            'Identificação e documentação dos pontos',
            'Melhor manutenção e futuras expansões'
          ]
        },
        {
          id: 'wifi-corporativo',
          label: 'Wi-Fi corporativo',
          img: 'img/portfolio/redes/2.svg',
          title: 'Rede Wi-Fi para áreas comuns',
          desc: 'Cobertura planejada para áreas internas e externas do condomínio.',
          features: [
            'Access points gerenciáveis',
            'Rede de convidados separada',
            'Monitoramento de desempenho',
            'Maior estabilidade de conexão'
          ]
        },
        {
          id: 'backbone',
          label: 'Backbone e cabeamento estruturado',
          img: 'img/portfolio/redes/3.svg',
          title: 'Cabeamento estruturado para dados e CFTV',
          desc: 'Infraestrutura preparada para dados, voz e vídeo no mesmo padrão.',
          features: [
            'Cabos e conectores certificados',
            'Padrões de montagem consolidados',
            'Facilidade para futuras expansões',
            'Organização que reduz tempo de manutenção'
          ]
        }
      ]
    },

    // INTERFONIA & VÍDEOPORTEIRO (mantido, pode ajustar depois se quiser)
    interfonia: {
      title: 'Interfonia & vídeoporteiro',
      subtitle: 'Comunicação clara entre portaria, blocos e moradores.',
      items: [
        {
          id: 'videoporteiro-ip',
          label: 'Vídeoporteiro IP',
          img: 'img/portfolio/interfonia/1.svg',
          title: 'Paineis externos com vídeo em alta definição',
          desc: 'Identificação visual antes de liberar o acesso ao condomínio.',
          features: [
            'Imagem em alta resolução',
            'Acesso pelo app do morador (quando disponível)',
            'Registro de chamadas e eventos',
            'Integração com controle de acesso e CFTV'
          ]
        },
        {
          id: 'interfonia-cond',
          label: 'Interfonia de condomínio',
          img: 'img/portfolio/interfonia/2.svg',
          title: 'Matriz, módulos e ramais',
          desc: 'Comunicação entre portaria, blocos e apartamentos.',
          features: [
            'Ramais dedicados por unidade',
            'Integração com controle de acesso',
            'Soluções IP e analógicas',
            'Facilidade de uso pelos moradores'
          ]
        },
        {
          id: 'porteiro-remoto',
          label: 'Porteiro remoto',
          img: 'img/portfolio/interfonia/3.svg',
          title: 'Estrutura preparada para portaria remota',
          desc: 'Infraestrutura pronta para operação de portaria remota 24h.',
          features: [
            'Integração entre interfonia, CFTV e controle de acesso',
            'Automação da abertura de portões',
            'Registro de todos os eventos de acesso',
            'Mais segurança com redução de custos de portaria física'
          ]
        }
      ]
    }
  };


  function renderItem(item){
    if (!item) return;
    imgEl.src = item.img || '';
    imgEl.alt = item.title || '';
    itemTitleEl.textContent = item.title || '';
    itemDescEl.textContent = item.desc || '';
    featuresEl.innerHTML = '';
    (item.features || []).forEach(text=>{
      const li = document.createElement('li');
      li.textContent = text;
      featuresEl.appendChild(li);
    });
  }

  
  function open(cat){
    const catData = DATA[cat];
    if (!catData) {
      return;
    }

    // Modo especial para CFTV com categorias (Linha IP, Linha analógica, Gravadores)
    const hasCategories = Array.isArray(catData.categories);

    // Limpa detalhes atuais
    imgEl.src = '';
    itemTitleEl.textContent = '';
    itemDescEl.textContent = '';
    featuresEl.innerHTML = '';

    titleEl.textContent = catData.title || '';
    subtitleEl.textContent = catData.subtitle || '';

    listEl.innerHTML = '';
    listEl.classList.remove('service-modal__list--grid');

    if (hasCategories) {
      // Mostra 3 cards lado a lado para as categorias de CFTV
      listEl.classList.add('service-modal__list--grid');

      const showCategoryItems = (category) => {
        listEl.classList.remove('service-modal__list--grid');
        listEl.innerHTML = '';

        // Botão de voltar para as categorias
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'service-modal__option service-modal__option--back';
        backBtn.textContent = '← Voltar para categorias de CFTV';
        backBtn.addEventListener('click', () => open('cftv'));
        listEl.appendChild(backBtn);

        subtitleEl.textContent = category.subtitle || catData.subtitle || '';

        let firstBtn = null;
        (category.items || []).forEach((item, index) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'service-modal__option';
          btn.textContent = item.label || item.title || 'Opção';
          btn.addEventListener('click', () => {
            listEl.querySelectorAll('.service-modal__option').forEach(b=>b.classList.remove('is-active'));
            btn.classList.add('is-active');
            renderItem(item);
          });
          listEl.appendChild(btn);
          if (index === 0) firstBtn = btn;
        });

        if (firstBtn) firstBtn.click();
      };

      (catData.categories || []).forEach((category) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'service-modal__category';
        btn.innerHTML = `
          <div class="service-modal__category-thumb">
            <img src="${category.thumb || ''}" alt="${category.label || ''}">
          </div>
          <div class="service-modal__category-title">${category.label || ''}</div>
        `;
        btn.addEventListener('click', () => showCategoryItems(category));
        listEl.appendChild(btn);
      });

      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      return;
    }

    // Comportamento padrão (sem categorias)
    let firstBtn = null;

    (catData.items || []).forEach((item, index)=>{
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'service-modal__option';
      btn.textContent = item.label || item.title || 'Opção';
      btn.addEventListener('click', ()=>{
        listEl.querySelectorAll('.service-modal__option').forEach(b=>b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderItem(item);
      });
      listEl.appendChild(btn);
      if (index === 0) firstBtn = btn;
    });

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (firstBtn) firstBtn.click();
  }


  function close(){
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (overlay) {
    overlay.addEventListener('click', close);
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', close);
  }

  document.addEventListener('keydown', (ev)=>{
    if (ev.key === 'Escape') {
      close();
    }
  });

  // Disponibiliza a função global para o handler dos cards
  window.openSolutionModal = open;
})();

// Slider simples para os destaques (hero-slider)
document.addEventListener('DOMContentLoaded', function(){
  const slider = document.querySelector('.hero-slider');
  if(!slider) return;

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const dots = Array.from(slider.querySelectorAll('.hero-slider__dots button'));
  if(slides.length === 0) return;

  let current = 0;
  let timer = null;

  function goTo(index){
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i)=>{
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach((dot, i)=>{
      dot.classList.toggle('is-active', i === current);
    });
  }

  function start(){
    stop();
    if(slides.length <= 1) return;
    timer = setInterval(function(){
      goTo(current + 1);
    }, 5000);
  }

  function stop(){
    if(timer){
      clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, index)=>{
    dot.addEventListener('click', function(){
      goTo(index);
      start();
    });
  });

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);

  // inicia o slider
  goTo(0);
  start();
});
