// Defensive: force-hide lightbox on load (prevents overlay stuck)
document.addEventListener('DOMContentLoaded', ()=>{
  const lb = document.getElementById('lightbox');
  if(lb) lb.hidden = true;
});

document.addEventListener('DOMContentLoaded',()=>{
  if(window.lucide) lucide.createIcons();
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const t=a.getAttribute('href'),o=document.querySelector(t);
      o&&(e.preventDefault(),o.scrollIntoView({behavior:'smooth',block:'start'}),mobileMenu.classList.remove('open'))
    })
  });
  const e=document.querySelector('.nav-toggle');
  window.mobileMenu=document.getElementById('mobileMenu');
  e&&e.addEventListener('click',()=>{mobileMenu.classList.toggle('open')})
});
(function(){
  const e=new URLSearchParams(window.location.search).get('admin')==='1',
        t=document.querySelector('.cases-controls'),
        o=document.getElementById('testimonials'),
        n=document.getElementById('toggleEdit'),
        a=document.getElementById('editPanel'),
        d=document.getElementById('testimonialForm'),
        l=document.getElementById('tNome'),
        c=document.getElementById('tCargo'),
        s=document.getElementById('tTexto'),
        i=document.getElementById('tIndex'),
        r=document.getElementById('cancelEdit'),
        m=document.getElementById('exportTestimonials'),
        p=document.getElementById('importFile');
  function g(){return[
    {nome:'Luiz',cargo:'Síndico ',texto:'Serviço rápido, atendimento excelente e instalação impecável. A Desvello superou minhas expectativas!'},
    {nome:'Carla',cargo:'Bloco Alpha',texto:'Profissionais de confiança. Resolveram o problema do meu sistema de câmeras no mesmo dia. Recomendo muito!'},
    {nome:'Evaldo Maia',cargo:'Produtor Rural',texto:'Qualidade, organização e preço justo. Meu portão e interfone nunca funcionaram tão bem!'}]
  }
  function u(){try{return JSON.parse(localStorage.getItem('desvello_testimonials_v1'))||g()}catch(e){return g()}}
  function h(e){localStorage.setItem('desvello_testimonials_v1',JSON.stringify(e))}
  function v(){
    if(!o)return;
    const e=u();
    o.innerHTML=e.map((t,n)=>'<div class="card"><p>'+b(t.texto)+'</p><div class="caption">'+b(t.nome+(t.cargo?' — '+t.cargo:''))+'</div>'+(S?'<div class="t-actions" data-i="'+n+'"><button class="btn btn-outline t-edit" type="button">Editar</button><button class="btn t-del" type="button">Excluir</button></div>':'')+'</div>').join('')
  }
  function b(e){
    return e.replace(/[&<>"']/g,(e=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[e])))
  }
  const S=e;
  t&&(t.style.display=S?'':'none'),
  S&&n&&n.addEventListener('click',(()=>{a.hidden=!a.hidden})),
  S&&d&&d.addEventListener('submit',(e=>{
    e.preventDefault();
    const t=parseInt(i.value,10),
          n={nome:l.value.trim(),cargo:c.value.trim(),texto:s.value.trim()};
    if(!n.nome||!n.texto)return;
    const a=u();
    t>=0&&t<a.length?a[t]=n:a.push(n),
    h(a),
    i.value=-1,
    d.reset(),
    v(),
    alert('Depoimento salvo!')
  })),
  S&&r&&r.addEventListener('click',(()=>{i.value=-1,d.reset()})),
  S&&o&&o.addEventListener('click',(e=>{
    const t=e.target.closest('button');
    if(!t)return;
    const n=t.closest('.t-actions');
    if(!n)return;
    const a=parseInt(n.getAttribute('data-i'),10),d=u();
    if(t.classList.contains('t-edit')){
      const e=d[a];
      l.value=e.nome,
      c.value=e.cargo||'',
      s.value=e.texto,
      i.value=a,
      a.hidden&&(a.hidden=!1),
      window.scrollTo({top:a.getBoundingClientRect().top+window.scrollY-100,behavior:'smooth'})
    }else t.classList.contains('t-del')&&confirm('Excluir este depoimento?')&&(d.splice(a,1),h(d),v())
  })),
  S&&m&&m.addEventListener('click',(()=>{
    const e=new Blob([JSON.stringify(u(),null,2)],{type:'application/json'}),
          t=URL.createObjectURL(e),
          o=document.createElement('a');
    o.href=t,
    o.download='depoimentos.json',
    o.click(),
    URL.revokeObjectURL(t)
  })),
  S&&p&&p.addEventListener('change',(async()=>{
    const e=p.files[0];if(!e)return;
    const t=await e.text();
    try{
      const e=JSON.parse(t);
      Array.isArray(e)?(h(e),v(),alert('Importado com sucesso!')):alert('Arquivo inválido: esperado um array JSON.')
    }catch(e){
      alert('Não foi possível ler o JSON.')
    }
    p.value=''
  })),
  v()
})();

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
          thumb: 'img/portfolio/cftv/ip/11.webp',
          subtitle: 'Linha IP WCAM da WEG, com câmeras de 2MP, 4MP e 5MP, além de NVRs para projetos IP completos.',
          items: [
            {
              id: 'ip-h022-b11',
              label: 'WCAM IP-H022-B11 – Bullet 2MP',
              img: 'img/portfolio/cftv/ip/1.webp',
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
              img: 'img/portfolio/cftv/ip/2.webp',
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
              img: 'img/portfolio/cftv/ip/3.webp',
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
              img: 'img/portfolio/cftv/ip/4.webp',
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
              img: 'img/portfolio/cftv/ip/5.webp',
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
              img: 'img/portfolio/cftv/ip/6.webp',
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
              img: 'img/portfolio/cftv/ip/7.webp',
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
              img: 'img/portfolio/cftv/ip/8.webp',
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
              img: 'img/portfolio/cftv/ip/9.webp',
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
              img: 'img/portfolio/cftv/ip/10.webp',
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
              img: 'img/portfolio/cftv/ip/11.webp',
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
          thumb: 'img/portfolio/cftv/an/6.webp',
          subtitle: 'Linha analógica WCAM da WEG, ideal para projetos com DVR em HD e Full HD.',
          items: [
            {
              id: 'an-p012-b11',
              label: 'WCAM AN-P012-B11 – Bullet HD',
              img: 'img/portfolio/cftv/an/1.webp',
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
              img: 'img/portfolio/cftv/an/2.webp',
              title: 'Câmera WCAM AN-P012-D11',
              desc: 'Dome analógica HD com redução digital de ruído, indicada para ambientes internos ou cobertos que precisam de boa definição com baixo custo.',
              features: [
                'Resolução HD (1MP 720p)',
                'Sensor CMOS progressivo com imagem estável',
                'Tecnologia AHD compatível com DVRs HD',
                'Redução digital de ruído (DNR) para cenas mais limpas'
              ]
            },
            {
              id: 'an-p022-b11',
              label: 'WCAM AN-P022-B11 – Bullet Full HD',
              img: 'img/portfolio/cftv/an/3.webp',
              title: 'Câmera WCAM AN-P022-B11',
              desc: 'Bullet analógica Full HD com tecnologia que aprimora a definição e filtra excesso de luz, ideal para fachadas e perímetros.',
              features: [
                'Resolução Full HD (2MP 1080p)',
                'Filtragem de luz para melhor contraste',
                'Indicada para áreas externas e perímetro',
                'Compatível com DVRs HD de mercado'
              ]
            },
            {
              id: 'an-p022-d11',
              label: 'WCAM AN-P022-D11 – Dome Full HD',
              img: 'img/portfolio/cftv/an/4.webp',
              title: 'Câmera WCAM AN-P022-D11',
              desc: 'Dome analógica Full HD com Global Shutter e suporte 4 em 1, para imagens nítidas e compatibilidade com diversos padrões de DVR.',
              features: [
                'Resolução Full HD (2MP 1080p)',
                'Tecnologia 4 em 1: AHD, HDTVI, HDCVI e CVBS',
                'Global Shutter — movimentos sem distorções',
                'IR de aproximadamente 20 m para visão noturna'
              ]
            },
            {
              id: 'an-m022-d11',
              label: 'WCAM AN-M022-D11 – Dome metálico Full HD',
              img: 'img/portfolio/cftv/an/5.webp',
              title: 'Câmera WCAM AN-M022-D11',
              desc: 'Dome analógica Full HD com case metálico e IP66, indicada para locais que exigem mais robustez e durabilidade.',
              features: [
                'Resolução em alta definição (Full HD)',
                'Case metálico com proteção IP66 contra chuva e poeira',
                'Aplicação em ambientes internos e externos',
                'Boa opção para condomínios e comércios'
              ]
            },
            {
              id: 'an-m022-b31',
              label: 'WCAM AN-M022-B31 – Bullet Full HD Night Color',
              img: 'img/portfolio/cftv/an/6.webp',
              title: 'Câmera WCAM AN-M022-B31',
              desc: 'Bullet analógica Full HD de alto desempenho, com múltiplas configurações e foco em definição de imagem.',
              features: [
                'Resolução Full HD com alta qualidade de imagem',
                'Quatro possíveis configurações para ajustar a definição',
                'Indicada para projetos profissionais de CFTV',
                'Compatível com DVRs HD multi-tecnologia'
              ]
            },
            {
              id: 'an-m022-d31',
              label: 'WCAM AN-M022-D31 – Dome Full HD Night Color',
              img: 'img/portfolio/cftv/an/7.webp',
              title: 'Câmera WCAM AN-M022-D31',
              desc: 'Dome analógica Full HD com grande redução de ruídos, cores reais e luz suplementar para até 20 m.',
              features: [
                'Resolução Full HD com cores reais',
                'Tecnologia com forte redução de ruídos digitais',
                'Luz suplementar em torno de 20 m para cenas noturnas',
                'Indicada para áreas internas e externas'
              ]
            },
            {
              id: 'an-m02v-b11',
              label: 'WCAM AN-M02V-B11 – Bullet varifocal',
              img: 'img/portfolio/cftv/an/8.webp',
              title: 'Câmera WCAM AN-M02V-B11',
              desc: 'Bullet analógica varifocal Full HD, permitindo ampliar a imagem sem distorções e com alcance de até cerca de 45 m em IR.',
              features: [
                'Resolução Full HD (2MP 1080p)',
                'Lente varifocal manual (~2,8–12 mm)',
                'Case metálico com proteção IP66',
                'Compatível com AHD, HDTVI, HDCVI e CVBS'
              ]
            },
            {
              id: 'an-m02v-d11',
              label: 'WCAM AN-M02V-D11 – Dome varifocal IK10',
              img: 'img/portfolio/cftv/an/9.webp',
              title: 'Câmera WCAM AN-M02V-D11',
              desc: 'Dome analógica varifocal Full HD com case metálico, IP66 e proteção antivandalismo IK10, ideal para ambientes críticos.',
              features: [
                'Resolução Full HD (2MP 1080p)',
                'Lente varifocal manual (2,8–12 mm)',
                'Proteção IP66 e antivandalismo IK10',
                'Tecnologia 4 em 1 (AHD, HDTVI, HDCVI, CVBS)'
              ]
            }
          ]
        },
        {
          id: 'cftv-nvr-dvr',
          label: 'NVRs / DVRs WEG',
          thumb: 'img/portfolio/cftv/dvr/5.webp',
          subtitle: 'Gravadores digitais e de rede WEG para sistemas IP e analógicos.',
          items: [
            {
              id: 'DV-M04F-131',
              label: 'DVR-M04F-131 – 4 canais',
              img: 'img/portfolio/cftv/dvr/1.webp',
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
              img: 'img/portfolio/cftv/dvr/2.webp',
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
              img: 'img/portfolio/cftv/dvr/3.webp',
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
              img: 'img/portfolio/cftv/dvr/4.webp',
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
              img: 'img/portfolio/cftv/dvr/5.webp',
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
              img: 'img/portfolio/cftv/dvr/6.webp',
              title: 'NV-M16K-231 IP - 16 Canais',
              desc: 'Projetado para alta performance, oferece resolução UHD (4K), 2 interfaces SATA para discos de até 12TB (discos não inclusos) e I/Os de alarme (8 entradas e 2 saídas). Conta com IA embarcada para detecção de linha e área de intrusão, além de reconhecimento facial, ideal para sistemas inteligentes e robustos.',
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
      subtitle: 'Escolha o tipo de controle de acesso que você quer visualizar.',
      categories: [
        {
          id: 'facial',
          label: 'Linha facial',
          thumb: 'img/portfolio/acesso/facial/1.webp',
          subtitle: 'Controladores com reconhecimento facial Control iD.',
          items: [
            {
              id: 'iDFaceMax',
              label: 'Controle de acesso iDFace Max',
              img: 'img/portfolio/acesso/facial/1.webp',
              title: 'Controle de Acesso iDFace Max',
              desc: 'Dispositivo facial com display de 7" e alta capacidade de usuários, ideal para condomínios e empresas.',
              features: [
                'Display touchscreen de 7"',
                'Capacidade para até 10.000 / 50.000 / 100.000 faces (conforme licença)',
                'Detecção de rosto vivo (anti-fraude)',
                'Grau de Proteção IP65',
                'Regras de acesso por grupos e horários'
              ]
            },
            {
              id: 'iDFace',
              label: 'Controle de Acesso iDFace',
              img: 'img/portfolio/acesso/facial/2.webp',
              title: 'Controle de Acesso iDFace',
              desc: 'Controlador facial compacto, indicado para portarias e recepções com alto fluxo.',
              features: [
                'Display touchscreen de 3,5”',
                'Identificação de até 30.000 faces com detecção de rosto vivo',
                'Regras de acesso personalizadas por grupos e horários',
                'Interfone SIP integrado'
              ]
            }
          ]
        },
        {
          id: 'biometrico',
          label: 'Linha biométrica',
          thumb: 'img/portfolio/acesso/biome/1.webp',
          subtitle: 'Controladores biométricos (digitais, cartão e senha) da Control iD.',
          items: [
            {
              id: 'iDAccessPro',
              label: 'iDAccess Pro',
              img: 'img/portfolio/acesso/biome/1.webp',
              title: 'Controle de Acesso iDAccess Pro',
              desc: 'Controlador biométrico de alta performance para ambientes corporativos.',
              features: [
                'Display touchscreen de 3,5"',
                'Identificação biométrica 1:N de até 100.000 digitais (conforme modelo)',
                'Regras de acesso personalizadas por grupos e horários',
                'Módulo de acionamento externo com relé'
              ]
            },
            {
              id: 'iDAccessNano',
              label: 'iDAccess Nano',
              img: 'img/portfolio/acesso/biome/2.webp',
              title: 'Controle de Acesso iDAccess Nano',
              desc: 'Versão compacta do iDAccess, ideal para locais com pouco espaço físico.',
              features: [
                'Design compacto e moderno',
                'Biometria, cartão e senha (conforme modelo)',
                'Alta capacidade de digitais',
                'Módulo de acionamento externo'
              ]
            },
            {
              id: 'iDAccess',
              label: 'iDAccess',
              img: 'img/portfolio/acesso/biome/3.webp',
              title: 'Controle de Acesso iDAccess',
              desc: 'Controlador biométrico clássico com grande capacidade de usuários.',
              features: [
                'Biometria, cartão de proximidade e senha',
                'Alta capacidade de usuários e registros',
                'Regras de acesso por grupos e horários',
                'Software web embarcado'
              ]
            },
            {
              id: 'iDFlex',
              label: 'iDFlex',
              img: 'img/portfolio/acesso/biome/4.webp',
              title: 'Controle de Acesso iDFlex',
              desc: 'Controlador biométrico robusto para uso intenso em empresas.',
              features: [
                'Biometria, cartão (MIFARE / 125 kHz) e senha',
                'Projetado para uso corporativo',
                'Módulo de acionamento externo',
                'Software embarcado para gestão de acessos'
              ]
            },
            {
              id: 'iDFlexIP65',
              label: 'iDFlex IP65',
              img: 'img/portfolio/acesso/biome/5.webp',
              title: 'Controle de Acesso iDFlex IP65',
              desc: 'Versão IP65 do iDFlex para ambientes externos e úmidos.',
              features: [
                'Grau de proteção IP65',
                'Biometria, cartão e senha',
                'Alta capacidade de usuários (conforme modelo)',
                'Software web para gerenciamento'
              ]
            },
            {
              id: 'iDFit4x2',
              label: 'iDFit 4x2',
              img: 'img/portfolio/acesso/biome/6.webp',
              title: 'Controle de Acesso iDFit 4x2',
              desc: 'Controlador biométrico em formato 4x2 para embutir na parede.',
              features: [
                'Formato 4x2 para caixa de embutir',
                'Biometria, cartão e senha (conforme modelo)',
                'Ideal para residências e escritórios',
                'Integração com fechaduras elétricas'
              ]
            }
          ]
        },
        {
          id: 'proximidade',
          label: 'Linha proximidade',
          thumb: 'img/portfolio/acesso/prox/1.webp',
          subtitle: 'Controladores por cartão/tag de proximidade (RFID) Control iD.',
          items: [
            {
              id: 'iDAccessPro-Prox',
              label: 'iDAccess Pro Prox',
              img: 'img/portfolio/acesso/prox/1.webp',
              title: 'Controle de Acesso iDAccess Pro Prox',
              desc: 'Controlador de acesso por proximidade (cartão/tag RFID), ideal para empresas corporativas. Display 3.5", processamento rápido e software embarcado para gestão de acessos.',
              features: [
                'Leitura por proximidade (cartão/tag RFID – MIFARE / ASK / HID)',
                'Display touchscreen 3.5”',
                'Processador quad-core 1.2 GHz para respostas rápidas',
                'Software de gestão de acessos embarcado',
                'Permite integração com fechaduras, portas, catracas etc.'
              ]
            },
            {
              id: 'iDAccessNano-Prox',
              label: 'iDAccess Nano Prox',
              img: 'img/portfolio/acesso/prox/2.webp',
              title: 'Controle de Acesso iDAccess Nano Prox',
              desc: 'Versão compacta para ambientes pequenos, com leitura RFID por proximidade, ideal para condomínios ou salas comerciais.',
              features: [
                'Design compacto e discreto',
                'Leitura cartão/tag RFID (MIFARE / ASK / HID)',
                'Módulo de acionamento externo compatível',
                'Fácil instalação e integração'
              ]
            },
            {
              id: 'iDFlex-Pro-Prox',
              label: 'Controle de Acesso iDFlex Pro Prox',
              img: 'img/portfolio/acesso/prox/3.webp',
              title: 'Controle de Acesso iDFlex Prox',
              desc: 'Com sua arquitetura inovadora e design moderno, o iDFlex Pro Prox é um controlador de acesso compacto',
              features: [
                'Leitura por proximidade (cartão/tag)',
                'Funcionamento online/offline',
                'Capacidade para muitos usuários',
                'Relés de saída para acionamento de portas',
                'Display touchscreen'
              ]
            },
            {
              id: 'iDFlex-IP65-Prox',
              label: 'Controle de Acesso iDFlex IP65 Prox',
              img: 'img/portfolio/acesso/prox/4.webp',
              title: 'Controle de Acesso iDFlex IP65 Prox',
              desc: 'O controlador de acesso iDFlex IP65 Prox foi projetado para uso em ambientes que ofereçam risco de umidade ou poeira.',
              features: [
                'Leitura por proximidade (cartão/tag)',
                'Funcionamento online/offline',
                'Capacidade para muitos usuários',
                'Relés de saída para acionamento de portas',
                'Display touchscreen'
              ]
            },
            {
              id: 'iDTouch-Prox',
              label: 'iDTouch Prox',
              img: 'img/portfolio/acesso/prox/5.webp',
              title: 'Controle de Acesso iDTouch Prox',
              desc: 'Teclado + leitor RFID, leitura de cartão/tag ou senha — ideal para pontes de acesso simples em condomínios ou pequenas empresas.',
              features: [
                'Leitor de proximidade + senha',
                'Capacidade para até 1000 usuários/cartões',
                'Relé de saída para porta',
                'Teclado capacitivo retroiluminado'
              ]
            }
          ]
        },
        {
          id: 'catracas',
          label: 'Catracas & torniquetes',
          thumb: 'img/portfolio/acesso/catracas/1.webp',
          subtitle: 'Linha completa de catracas e torniquetes Control iD para controle de fluxo de pessoas.',
          items: [
            {
              id: 'idblock-next-contador-giros',
              label: 'iDBlock Next com Contador de Giros',
              img: 'img/portfolio/acesso/catracas/1.webp',
              title: 'iDBlock Next com Contador de Giros',
              desc: 'Catraca inteligente com contador de giros integrado, ideal para controle de acesso em ambientes com grande fluxo.',
              features: [
                'Contador de giros integrado para relatórios de passagem',
                'Construção robusta para uso intenso',
                'Integração com controladores de acesso Control iD',
                'Versão inox ou pintada conforme projeto'
              ]
            },
            {
              id: 'idblock-next-bqc-idface-max',
              label: 'iDBlock Next BQC com iDFace Max',
              img: 'img/portfolio/acesso/catracas/2.webp',
              title: 'iDBlock Next BQC com iDFace Max',
              desc: 'Catraca facial inteligente com iDFace Max acoplado, perfeita para portarias modernas.',
              features: [
                'Reconhecimento facial de alta performance',
                'Integração total com software de controle de acesso',
                'Design premium para recepções e portarias',
                'Operação com baixo tempo de identificação'
              ]
            },
            {
              id: 'idblock-next-bqc-idface',
              label: 'iDBlock Next BQC com iDFace',
              img: 'img/portfolio/acesso/catracas/3.webp',
              title: 'iDBlock Next BQC com iDFace',
              desc: 'Catraca facial inteligente com iDFace, indicada para condomínios e empresas.',
              features: [
                'Equipamento facial compacto integrado à catraca',
                'Controle de acesso por face, cartão e senha (conforme configuração)',
                'Ideal para locais com fluxo médio a alto',
                'Relatórios de acesso por usuário e horário'
              ]
            },
            {
              id: 'idblock-next-idface-max',
              label: 'iDBlock Next com iDFace Max',
              img: 'img/portfolio/acesso/catracas/4.webp',
              title: 'iDBlock Next com iDFace Max',
              desc: 'Catraca pedestal com módulo iDFace Max acoplado na parte superior.',
              features: [
                'Reconhecimento facial com display de 7"',
                'Controle de acesso sem contato físico',
                'Aplicação em recepções, academias e portarias',
                'Integração com outros sistemas via rede'
              ]
            },
            {
              id: 'idblock-next',
              label: 'iDBlock Next',
              img: 'img/portfolio/acesso/catracas/5.webp',
              title: 'iDBlock Next',
              desc: 'Catraca inteligente padrão iDBlock, preparada para integração com diversos leitores.',
              features: [
                'Estrutura moderna e compacta',
                'Compatível com leitores biométricos, proximidade e faciais',
                'Alta durabilidade para uso intensivo',
                'Acionamento silencioso e confiável'
              ]
            },
            {
              id: 'idblock-facial',
              label: 'iDBlock Facial',
              img: 'img/portfolio/acesso/catracas/6.webp',
              title: 'iDBlock Facial',
              desc: 'Catraca facial inteligente com terminal embarcado no gabinete.',
              features: [
                'Reconhecimento facial rápido e seguro',
                'Operação 100% sem toque',
                'Ideal para ambientes corporativos e condomínios',
                'Relatórios completos de acesso'
              ]
            },
            {
              id: 'idblock-facial-mini-idface-max',
              label: 'iDBlock Facial Mini com iDFace Max',
              img: 'img/portfolio/acesso/catracas/7.webp',
              title: 'iDBlock Facial Mini com iDFace Max',
              desc: 'Versão compacta de catraca facial com iDFace Max integrado.',
              features: [
                'Gabinete mais curto para espaços reduzidos',
                'Terminal facial com alta capacidade de usuários',
                'Design clean e moderno',
                'Integração com sistemas de gestão de acesso'
              ]
            },
            {
              id: 'idblock-facial-mini',
              label: 'iDBlock Facial Mini',
              img: 'img/portfolio/acesso/catracas/8.webp',
              title: 'iDBlock Facial Mini',
              desc: 'Catraca facial compacta para recepções, escritórios e academias.',
              features: [
                'Tamanho reduzido com alta tecnologia',
                'Reconhecimento facial rápido',
                'Baixo consumo de energia',
                'Instalação simplificada'
              ]
            },
            {
              id: 'idblock-preta',
              label: 'iDBlock Preta',
              img: 'img/portfolio/acesso/catracas/9.webp',
              title: 'iDBlock Preta',
              desc: 'Catraca biométrica digital inteligente com acabamento preto.',
              features: [
                'Design discreto e elegante',
                'Leitor biométrico integrado',
                'Ideal para ambientes internos',
                'Compatível com cartões e senhas (conforme configuração)'
              ]
            },
            {
              id: 'idblock-inox',
              label: 'iDBlock Inox',
              img: 'img/portfolio/acesso/catracas/10.webp',
              title: 'iDBlock Inox',
              desc: 'Catraca biométrica digital com gabinete em aço inoxidável.',
              features: [
                'Estrutura em inox para maior durabilidade',
                'Resistente a ambientes mais úmidos',
                'Leitor biométrico ou proximidade integrado',
                'Indicado para indústrias, condomínios e comércios'
              ]
            },
            {
              id: 'idblock-qr-code',
              label: 'iDBlock QR Code',
              img: 'img/portfolio/acesso/catracas/11.webp',
              title: 'iDBlock QR Code',
              desc: 'Catraca com leitura de QR Code para acesso por credencial digital.',
              features: [
                'Leitor de QR Code integrado',
                'Ideal para visitantes e acesso temporário',
                'Integração com sistemas web e aplicativos',
                'Permite uso combinado com outras credenciais'
              ]
            },
            {
              id: 'idblock-balcao-biometrica',
              label: 'iDBlock Balcão Biométrica',
              img: 'img/portfolio/acesso/catracas/12.webp',
              title: 'iDBlock Balcão Biométrica',
              desc: 'Catraca tipo balcão biométrica para controle de filas e recepções.',
              features: [
                'Formato balcão para passagem organizada',
                'Leitor biométrico integrado',
                'Aplicação em acesso interno controlado',
                'Integração com sistemas de controle de acesso'
              ]
            },
            {
              id: 'idblock-balcao-facial-idface-max',
              label: 'iDBlock Balcão Facial com iDFace Max',
              img: 'img/portfolio/acesso/catracas/13.webp',
              title: 'iDBlock Balcão Facial com iDFace Max',
              desc: 'Catraca balcão com terminal facial iDFace Max na parte superior.',
              features: [
                'Reconhecimento facial avançado',
                'Ideal para recepções de alto padrão',
                'Passagem confortável e segura',
                'Integração com relatórios de acesso'
              ]
            },
            {
              id: 'idblock-balcao-facial-idface',
              label: 'iDBlock Balcão Facial com iDFace',
              img: 'img/portfolio/acesso/catracas/14.webp',
              title: 'iDBlock Balcão Facial com iDFace',
              desc: 'Versão balcão com iDFace, indicada para fluxo médio de pessoas.',
              features: [
                'Terminal facial compacto',
                'Controle de acesso por face e outras credenciais',
                'Estrutura de aço robusta',
                'Aplicação em prédios corporativos e condomínios'
              ]
            },
            {
              id: 'idblock-pcd',
              label: 'iDBlock PcD',
              img: 'img/portfolio/acesso/catracas/15.webp',
              title: 'iDBlock PcD',
              desc: 'Catraca PcD biométrica digital para acessibilidade.',
              features: [
                'Passagem mais larga para cadeirantes',
                'Altura e ergonomia pensadas para PcD',
                'Leitor biométrico integrado',
                'Integração com demais catracas do sistema'
              ]
            },
            {
              id: 'idblock-pcd-facial-idface-max',
              label: 'iDBlock PcD Facial com iDFace Max',
              img: 'img/portfolio/acesso/catracas/16.webp',
              title: 'iDBlock PcD Facial com iDFace Max',
              desc: 'Catraca PcD com reconhecimento facial, unindo acessibilidade e tecnologia.',
              features: [
                'Reconhecimento facial sem contato',
                'Passagem ampla e confortável',
                'Ideal para empresas e condomínios inclusivos',
                'Configurações avançadas de acesso'
              ]
            },
            {
              id: 'idblock-pcd-facial',
              label: 'iDBlock PcD Facial',
              img: 'img/portfolio/acesso/catracas/17.webp',
              title: 'iDBlock PcD Facial',
              desc: 'Versão PcD com terminal facial integrado.',
              features: [
                'Controle de acesso por face',
                'Passagem adaptada para PcD',
                'Integração com demais dispositivos Control iD',
                'Indicada para ambientes com política de acessibilidade'
              ]
            },
            {
              id: 'idblock-braco-articulado',
              label: 'iDBlock Braço Articulado',
              img: 'img/portfolio/acesso/catracas/18.webp',
              title: 'iDBlock Braço Articulado',
              desc: 'Catraca biométrica com braço articulado para liberar passagem em emergência ou carga.',
              features: [
                'Braço articulado com liberação total do vão',
                'Leitor biométrico integrado',
                'Ideal para locais onde às vezes é preciso liberar passagem livre',
                'Integração com controles de acesso e alarmes'
              ]
            },
            {
              id: 'torniquete-biometrico',
              label: 'Torniquetes',
              img: 'img/portfolio/acesso/catracas/19.webp',
              title: 'Torniquetes biométricos',
              desc: 'Torniquetes de corpo inteiro com autenticação biométrica.',
              features: [
                'Estrutura de alta robustez para áreas externas',
                'Controle de acesso por biometria e cartões',
                'Ideal para indústrias, portarias externas e áreas de alto risco',
                'Passagem unitária com alta segurança'
              ]
            },
            {
              id: 'torniquete-facial',
              label: 'Torniquete Facial',
              img: 'img/portfolio/acesso/catracas/20.webp',
              title: 'Torniquete com reconhecimento facial',
              desc: 'Torniquete com módulo facial integrado para acesso sem contato.',
              features: [
                'Reconhecimento facial rápido mesmo em ambientes externos',
                'Controle rígido de entrada e saída',
                'Integração com sistemas de monitoramento',
                'Indicado para grandes perímetros e indústrias'
              ]
            },
            {
              id: 'torniquete-facial-idface-max',
              label: 'Torniquete Facial com iDFace Max',
              img: 'img/portfolio/acesso/catracas/21.webp',
              title: 'Torniquete Facial com iDFace Max',
              desc: 'Versão de torniquete com iDFace Max para máxima segurança e identificação facial avançada.',
              features: [
                'Terminal facial com alta capacidade de usuários',
                'Controle de acesso rígido em áreas críticas',
                'Adequado para projetos de segurança avançada',
                'Integração com relatórios e monitoramento em tempo real'
              ]
            }
          ]
        },
        {
          id: 'uhf',
          label: 'Controle de acesso UHF',
          thumb: 'img/portfolio/acesso/antena/1.webp',
          subtitle: 'Leitores UHF de longa distância para controle veicular em condomínios e empresas.',
          items: [
            {
              id: 'iDUHF',
              label: 'iDUHF',
              img: 'img/portfolio/acesso/antena/1.webp',
              title: 'Controle de Acesso iDUHF',
              desc: 'Leitor UHF de longa distância com proteção IP65, ideal para controle de acesso veicular em condomínios corporativos e residenciais.',
              features: [
                'Leitura e autenticação de tags veiculares no próprio equipamento',
                'Alcance de leitura de até 15 m (dependendo da tag e instalação)',
                'Armazena até 200.000 usuários e mais de 200.000 registros',
                'Proteção IP65 e controle direto da placa de acionamento de motor',
                'Software web embarcado com comunicação TCP/IP'
              ]
            },
            {
              id: 'iDUHFLite',
              label: 'iDUHF Lite',
              img: 'img/portfolio/acesso/antena/2.webp',
              title: 'Controle de Acesso iDUHF Lite',
              desc: 'Versão compacta do iDUHF, mantendo a alta capacidade de usuários para acesso veicular com leitor UHF integrado.',
              features: [
                'Tamanho reduzido com leitor UHF integrado',
                'Alcance de leitura de até 12 m (dependendo da tag e instalação)',
                'Capacidade para até 200.000 usuários e registros',
                'Proteção IP65 e controle de placa de motor externa',
                'Software web embarcado e comunicação TCP/IP'
              ]
            }
          ]
        }
      ]
    },

    // AUTOMAÇÃO: linha WEG Smart Home
    automacao: {
      title: 'Automação residencial & Smart Home WEG',
      subtitle: 'Escolha a categoria de automação que você quer visualizar.',
      categories: [
        // =======================
        // CATEGORIA: MOTORES DE PORTÃO
        // =======================
        {
          id: 'motores',
          label: 'Motores de portão',
          thumb: 'img/portfolio/automacao/motores/ppa-5.webp',
          subtitle: 'Motores deslizantes residenciais e condominiais das linhas Rossi e PPA.',
          items: [
            // --------- LINHA ROSSI /   ---------
            {
              id: 'rossi-dz-1000-fast-af',
              label: 'DZ 1000 FAST AF (/Rossi)',
              img: 'img/portfolio/automacao/motores/rossi-1.webp',
              title: 'Motor DZ 1000 FAST AF',
              desc: 'Automatizador deslizante para portões residenciais, com abertura rápida e conjunto robusto para uso diário.',
              features: [
                'Indicado para portões deslizantes residenciais',
                'Velocidade de abertura otimizada para uso intenso',
                'Conjunto mecânico robusto para maior durabilidade',
                'Preparado para integração com controle remoto e automação'
              ]
            },
            {
              id: 'rossi-dz-1000-al',
              label: 'DZ 1000 AL ( /Rossi)',
              img: 'img/portfolio/automacao/motores/rossi-2.webp',
              title: 'Motor DZ 1000 AL',
              desc: 'Automatizador deslizante com foco em segurança e confiabilidade para casas e pequenos condomínios.',
              features: [
                'Uso indicado para portões deslizantes residenciais',
                'Projeto voltado para funcionamento silencioso',
                'Destravamento manual em caso de falta de energia',
                'Compatível com controles remotos e acessórios de segurança'
              ]
            },
            {
              id: 'rossi-dz-1000-fast-afe',
              label: 'DZ 1000 FAST AFe (/Rossi)',
              img: 'img/portfolio/automacao/motores/rossi-3.webp',
              title: 'Motor DZ 1000 FAST AFe',
              desc: 'Versão rápida da linha DZ, ideal para quem busca mais agilidade na abertura do portão.',
              features: [
                'Abertura rápida para reduzir tempo de espera na rua',
                'Indicado para portões deslizantes residenciais',
                'Conjunto mecânico dimensionado para uso frequente',
                'Preparado para integração com sistemas de controle de acesso'
              ]
            },
            {
              id: 'rossi-dr-350-fast-ny',
              label: 'DR 350 FAST NY ( /Rossi)',
              img: 'img/portfolio/automacao/motores/rossi-4.webp',
              title: 'Motor DR 350 FAST NY',
              desc: 'Automatizador deslizante compacto, ideal para portões leves em residências.',
              features: [
                'Tamanho reduzido, discreto na fachada',
                'Indicado para portões residenciais de uso diário',
                'Funcionamento suave e silencioso',
                'Compatível com fotocélulas e outros acessórios de segurança'
              ]
            },
            {
              id: 'rossi-dr-400-ny',
              label: 'DR 400 NY ( /Rossi)',
              img: 'img/portfolio/automacao/motores/rossi-5.webp',
              title: 'Motor DR 400 NY',
              desc: 'Automatizador deslizante versátil para residências e pequenas aplicações condominiais.',
              features: [
                'Projeto voltado para uso frequente',
                'Destravamento manual para situações de emergência',
                'Permitida a integração com controles remotos, botoeiras e receptores externos',
                'Boa opção para quem busca custo-benefício'
              ]
            },

            // --------- LINHA PPA ---------
            {
              id: 'ppa-dz-stark',
              label: 'Dz Stark (PPA)',
              img: 'img/portfolio/automacao/motores/ppa-1.webp',
              title: 'Automatizador Dz Stark',
              desc: 'Motor deslizante PPA indicado para portões residenciais que precisam de robustez e rapidez.',
              features: [
                'Linha muito utilizada em portões deslizantes residenciais',
                'Projeto robusto para uso diário',
                'Funcionamento suave e confiável',
                'Compatível com automatizações e acessórios PPA'
              ]
            },
            {
              id: 'ppa-dz-stark-home',
              label: 'Dz Stark Home (PPA)',
              img: 'img/portfolio/automacao/motores/ppa-2.webp',
              title: 'Automatizador Dz Stark Home',
              desc: 'Versão voltada para uso residencial, com foco em conforto e segurança no dia a dia.',
              features: [
                'Indicado para casas e pequenos condomínios',
                'Operação silenciosa, ideal para ambientes residenciais',
                'Integração simples com controles e receptores PPA',
                'Permite ajustes de tempo de abertura/fechamento'
              ]
            },
            {
              id: 'ppa-dz-rio',
              label: 'Dz Rio (PPA)',
              img: 'img/portfolio/automacao/motores/ppa-3.webp',
              title: 'Automatizador Dz Rio',
              desc: 'Modelo versátil da linha PPA, muito utilizado em projetos residenciais de portões deslizantes.',
              features: [
                'Construção dimensionada para uso frequente',
                'Boa relação entre performance e custo',
                'Compatível com diversos acessórios de segurança',
                'Marca consolidada em automatizadores de portões'
              ]
            },
            {
              id: 'ppa-dz-predial',
              label: 'Dz Predial (PPA)',
              img: 'img/portfolio/automacao/motores/ppa-4.webp',
              title: 'Automatizador Dz Predial',
              desc: 'Automatizador desenvolvido para aplicações prediais com maior fluxo de veículos.',
              features: [
                'Voltado para condomínios e prédios com maior movimento',
                'Projeto preparado para ciclos mais intensos de abertura',
                'Permite integração com controles de acesso do condomínio',
                'Ideal para garagens coletivas com alto giro'
              ]
            },
            {
              id: 'ppa-dz-condominium',
              label: 'Dz Condominium (PPA)',
              img: 'img/portfolio/automacao/motores/ppa-5.webp',
              title: 'Automatizador Dz Condominium',
              desc: 'Modelo da PPA pensado especificamente para portões de condomínios com uso intenso.',
              features: [
                'Dimensionado para grande fluxo de veículos',
                'Alta durabilidade para uso contínuo',
                'Integração com sistemas de portaria e controle de acesso',
                'Opção ideal para projetos condominiais de maior porte'
              ]
            }
          ]
        },
        // =======================
        // CATEGORIA: INTERRUPTORES
        // =======================
        {
          id: 'interruptores',
          label: 'Interruptores inteligentes',
          thumb: 'img/portfolio/automacao/interruptor/interruptor.webp',
          subtitle: 'Interruptores smart para controle de iluminação por app, voz e cenas.',
          items: [
            {
              id: 'interruptor',
              label: 'Interruptor Smart 1 a 6 Botões',
              img: 'img/portfolio/automacao/interruptor/interruptor.webp',
              title: 'Interruptor Smart WEG 1 a 6 Botões – ',
              desc: 'Controle de iluminação via aplicativo WEG Home, assistentes de voz e rotinas inteligentes.',
              features: [
                'Conexão Wi-Fi 2.4 GHz',
                'Comando manual e remoto',
                'Compatível com Alexa e Google Home',
                'Criação de rotinas e temporizadores',
                'Controle por voz, aplicativo ou interruptor padrão',
                'A linha oferece 10 opções nas cores branco e preto,',
                'com 1 a 4 botões para caixas 4×2” e 6 botões para caixas 4×4.'
              ]
            }
          ]
        },

        // =======================
        // CATEGORIA: TOMADAS
        // =======================
        {
          id: 'tomadas',
          label: 'Tomadas inteligentes',
          thumb: 'img/portfolio/automacao/tomada/tomada-smart.webp',
          subtitle: 'Controle e monitoramento de eletrodomésticos pela tomada.',
          items: [
            {
              id: 'tomada-smart',
              label: 'Tomada Inteligente',
              img: 'img/portfolio/automacao/tomada/tomada-smart.webp',
              title: 'Tomada Inteligente WEG',
              desc: 'Controle e monitore o consumo de equipamentos conectados como TVs, geladeiras e outros.',
              features: [
                'Monitoramento de energia em tempo real',
                'Liga e desliga pelo app ou voz',
                'Programação de horários',
                'Compatível com Alexa e Google',
                'Ideal para equipamentos até a potência suportada pelo modelo'
              ]
            }
          ]
        },

        // =======================
        // CATEGORIA: RELÉS
        // =======================
        {
          id: 'reles',
          label: 'Relés inteligentes',
          thumb: 'img/portfolio/automacao/rele/modulo-garagem.webp',
          subtitle: 'Módulos relé para automação de iluminação, portões, persianas e cargas diversas.',
          items: [
            {
              id: 'mod-portao-garagem',
              label: 'Módulo Portão de Garagem Wi-Fi',
              img: 'img/portfolio/automacao/rele/modulo-garagem.webp',
              title: 'Módulo Portão de Garagem Wi-Fi',
              desc: 'Controle o automatizador do portão direto pelo app WEG Home, com retorno de aberto/fechado.',
              features: [
                'Acionamento do portão pelo app WEG Home',
                'Leitura de estado aberto/fechado (sensor magnético)',
                'Indicado para portões de garagem residenciais',
                'Permite criar rotinas de entrada e saída'
              ]
            },
            {
              id: 'rele-2c-zigbee-rf',
              label: 'Relé 2 Canais Zigbee + RF 433',
              img: 'img/portfolio/automacao/rele/rele-interruptor2.webp',
              title: 'Relé Interruptor 2 Canais Zigbee + RF 433',
              desc: 'Automatize até dois circuitos independentes com um único relé Zigbee com RF integrado.',
              features: [
                'Dois canais de saída independentes',
                'Comunicação Zigbee + RF 433 MHz',
                'Ideal para iluminação e tomadas',
                'Controle via app, cenas e controles RF compatíveis'
              ]
            },
            {
              id: 'rele-contato-seco-zigbee-rf',
              label: 'Relé Contato Seco Zigbee + RF',
              img: 'img/portfolio/automacao/rele/rele-interruptor1.webp',
              title: 'Relé de Contato Seco 1 Canal Zigbee + RF',
              desc: 'Relé de contato seco robusto para acionar contatores e cargas mais pesadas.',
              features: [
                'Saída por contato seco (NA)',
                'Zigbee + RF 433 MHz integrado',
                'Instalação em laje, gesso, quadro ou caixa 4×2',
                'Indicado para bobinas de contatores e cargas robustas'
              ]
            },
            {
              id: 'mini-rele-zigbee',
              label: 'Mini Relé Zigbee',
              img: 'img/portfolio/automacao/rele/mini-rele-zigbee.webp',
              title: 'Mini Relé Interruptor Zigbee',
              desc: 'Relé compacto Zigbee para automatizar iluminação com cenas e agendamentos.',
              features: [
                'Formato mini para caber em caixas 4×2',
                'Comunicação Zigbee',
                'Cenas e agendamentos pelo app',
                'Controle via WEG Home e assistentes de voz'
              ]
            },
            {
              id: 'mini-rele-wifi',
              label: 'Mini Relé Wi-Fi',
              img: 'img/portfolio/automacao/rele/zigbee_mini_rele.webp',
              title: 'Mini Relé Interruptor Wi-Fi',
              desc: 'Relé Wi-Fi compacto para acionar pontos de luz e cargas simples por app ou voz.',
              features: [
                'Conexão Wi-Fi 2.4 GHz',
                'Instalação embutida em caixas ou forros',
                'Controle remoto e temporizações pelo app',
                'Compatível com Alexa e Google Assistente'
              ]
            },
            {
              id: 'rele-contato-seco-wifi-rf',
              label: 'Relé Contato Seco Wi-Fi + RF',
              img: 'img/portfolio/automacao/rele/whome_rele_interruptor.webp',
              title: 'Relé de Contato Seco 1 Canal Wi-Fi + RF',
              desc: 'Relé de contato seco para cargas AC/DC, ideal para quadros elétricos e automações robustas.',
              features: [
                'Contato seco para cargas em CA ou CC',
                'Wi-Fi 2.4 GHz + RF 433 MHz',
                'Acompanha suporte para trilho DIN',
                'Pode ser embutido em laje, gesso ou caixa 4×2'
              ]
            },
            {
              id: 'dimmer-wifi',
              label: 'Dimmer Wi-Fi',
              img: 'img/portfolio/automacao/rele/whome_rele_dimmer.webp',
              title: 'Dimmer Wi-Fi',
              desc: 'Controle a intensidade da iluminação pelo app WEG Home ou por comando de voz.',
              features: [
                'Ajuste de brilho 0–100%',
                'Conexão Wi-Fi 2.4 GHz',
                'Compatível com assistentes de voz',
                'Cenas e rotinas com diferentes níveis de luz'
              ]
            },
            {
              id: 'rele-persianas-wifi-rf',
              label: 'Controle de Persianas Wi-Fi + RF',
              img: 'img/portfolio/automacao/rele/whome_rele_cortina.webp',
              title: 'Controle de Persianas Wi-Fi + RF',
              desc: 'Relé específico para motores de persianas e cortinas, com controle por app e RF.',
              features: [
                'Controle de motores de persianas/cortinas',
                'Wi-Fi 2.4 GHz + RF 433 MHz',
                'Criação de cenários com luz natural',
                'Rotinas de abertura e fechamento automatizadas'
              ]
            }
          ]
        },

        // =======================
        // CATEGORIA: FECHADURAS
        // =======================
        {
          id: 'fechaduras',
          label: 'Fechaduras eletrônicas',
          thumb: 'img/portfolio/automacao/fechadura/embutir.webp',
          subtitle: 'Fechaduras digitais inteligentes compatíveis com o ecossistema WEG Home.',
          items: [
            {
              id: 'fechadura-Embutir',
              label: 'Fechadura Inteligente De Embutir',
              img: 'img/portfolio/automacao/fechadura/embutir.webp',
              title: 'Fechadura Inteligente De Embutir',
              desc: 'Praticidade é estar conectado com a sua casa a toda hora e de qualquer lugar. Com a Fechadura Inteligente de Embutir, você conta com 5 métodos de desbloqueio, fechamento automático e maçaneta ajustável para direita ou esquerda..',
              features: [
                'Compatível com portas de 35 a 60 mm',
                'Conexão Wi-Fi: IEEE 802.11 b/g/n 2.4 GHz',
                'Trava automática configurável',
                'Histórico de acessos no app',
                'Integração com cenas e rotinas inteligentes'
              ]
            },
            {
              id: 'Fechadura-Sobrepor-Standalone',
              label: 'Fechadura de Sobrepor Standalone',
              img: 'img/portfolio/automacao/fechadura/sobrepor-standalon.webp',
              title: 'Fechadura de Sobrepor Standalone',
              desc: 'Simples e segura, a Fechadura de Sobrepor Standalone oferece três métodos de abertura: senha numérica, cartão de acesso (tag) e chave, garantindo praticidade e confiabilidade para residências e estabelecimentos comerciais ou coletivos.',
              features: [
                '3 métodos de abertura: senha numérica, cartão de acesso (tag) e chave',
                'Modo visitante com senhas temporárias',
                'Trava automática configurável',
                'Alerta de bateria fraca pelo app',
                'Abertura por senha numérica'
              ]
            },
            {
              id: 'fFechadura-Inteligente-Sobrepor',
              label: 'Fechadura Inteligente de Sobrepor com Biometria',
              img: 'img/portfolio/automacao/fechadura/sobrepor-externa.webp',
              title: 'Fechadura Digital Smart – Biometria + Senha',
              desc: 'Modelo completo com biometria e senha, ideal para máxima segurança e praticidade.',
              features: [
                'Abertura por biometria, senha ou chave física',
                'Registro de múltiplas digitais',
                'Trava automática ao fechar',
                'Histórico de acessos via app',
                'Compatível com rotinas do ecossistema WEG Home'
              ]
            }
          ]
        },

        // =======================
        // CATEGORIA: ACESSÓRIOS
        // =======================
        {
          id: 'acessorios',
          label: 'Acessórios smart',
          thumb: 'img/portfolio/automacao/acessorios/controle_universal.webp',
          subtitle: 'Sensores e acessórios que complementam a automação WEG Home.',
          items: [
            {
              id: 'sensor-presenca',
              label: 'Sensor de Presença Smart',
              img: 'img/portfolio/automacao/acessorios/sensor_de_presenca.webp',
              title: 'Sensor de Presença Inteligente WEG',
              desc: 'O Sensor de Movimento Wi-Fi oferece segurança conectada à tecnologia para você e sua família. Com detecção precisa por infravermelho, ele envia alertas ao seu smartphone e permite acionar dispositivos, como acender uma lâmpada ou acionar um Câmera Interna PTZ Wi-Fi.',
              features: [
                'Detecção de movimento',
                'Envio de alertas pelo celular',
                'Criação de cenas automáticas (acende luz, aciona rotina)',
                'Tecnologia sem fio integrada ao ecossistema WEG',
                'Bateria interna recarregável com carregamento USB'
              ]
            },
            {
              id: 'Sensor Porta/Janela',
              label: 'Sensor Porta/Janela Wi-Fi',
              img: 'img/portfolio/automacao/acessorios/sensor_de_porta_janela.webp',
              title: 'Sensor Porta/Janela WEG',
              desc: 'O sensor de porta e janela Wi-Fi detecta aberturas em tempo real e envia notificações instantâneas ao seu smartphone. Monitore a abertura de portas, janelas e gavetas de medicamentos e crie rotinas automáticas integradas com outras soluções WEG Home.',
              features: [
                'Alertas em tempo real',
                'Envio de alertas pelo celular',
                'Disparo de alarme: notificação de detecção de movimento',
                'Tecnologia sem fio integrada ao ecossistema WEG',
                'Segurança: autenticação por usuário, encriptação de software'
              ]
            },
            {
              id: 'controle-remoto',
              label: 'Controle Remoto Infravermelho',
              img: 'img/portfolio/automacao/acessorios/controle_universal.webp',
              title: 'Controle IR Inteligente WEG',
              desc: 'Controle ar-condicionado, TVs e outros aparelhos infravermelho direto pelo app.',
              features: [
                'Cópia de comandos IR dos controles originais',
                'Integração com Alexa e Google Assistente',
                'Criação de cenas e automações por ambiente',
                'Controle infravermelho 360°'
              ]
            }
          ]
        }
      ]
    },

    // ALARME & PERÍMETRO: Intelbras e JFL, com 3 níveis (marca → categoria → produto)
       perimetro: {
      title: 'Alarme & perímetro',
      subtitle: 'Escolha a marca e o tipo de solução que você quer visualizar.',
      brands: [
        // =======================
        // INTELBRAS
        // =======================
        {
          id: 'intelbras',
          label: 'Intelbras',
          thumb: 'img/portfolio/perimetro/central-intelbras/amt2018.webp',
          types: [
    {
            id: 'intelbras-centrais',
            label: 'Centrais de alarme',
            subtitle: 'Centrais de alarme Intelbras para residências, comércios e grandes projetos monitorados.',
            items: [
          {
            id: 'amt-2018',
            label: 'Linha AMT 2018 (E / EG / SMART)',
            img: 'img/portfolio/perimetro/central-intelbras/amt2018.webp',
            title: 'Centrais de alarme Intelbras AMT 2018',
            desc: 'Linha de centrais compactas, indicada para casas e pequenos comércios que precisam de setorização simples e comunicação com monitoramento.',
            features: [
              'Até 18 zonas (misturando zonas com fio e sem fio, conforme modelo)',
            '2 saídas PGM programáveis ',
            'Teclados dedicados para armar/desarmar por setor',
            'Programação flexível para horários de entrada/saída e tipos de zona'
          ]
        },
        {
          id: 'amt-1000-smart',
          label: 'AMT 1000 SMART',
          img: 'img/portfolio/perimetro/central-intelbras/amt1000.webp',
          title: 'Central de alarme Intelbras AMT 1000 SMART',
          desc: 'Central supervisionada com acesso em nuvem, ideal para projetos residenciais e pequenos negócios que precisam de controle pelo aplicativo.',
          features: [
            'Comunicação via conexão IP (Ethernet) e/ou módulos adicionais',
            'Integração com aplicativo para armar/desarmar e receber notificações',
            'Setores com fio e sem fio supervisionados (detecção de falhas e violação)',
            ' Capacidade para até 12 zonas com fio e 24 zonas sem fio',
            'Ideal para quem quer monitorar o alarme direto pelo celular'
          ]
        },
        {
          id: 'amt-4010-smart',
          label: 'AMT 4010 (SMART / RF )',
          img: 'img/portfolio/perimetro/central-intelbras/amt4010.webp',
          title: 'Centrais de alarme Intelbras AMT 4010',
          desc: 'Central modular de alta capacidade, indicada para condomínios, comércios maiores e projetos monitorados 24h.',
          features: [
            'Capacidade para conexão de até 4 teclados, 4 receptores, 4 expansores de PGM e 6 expansores de Zonas.',
            '3 saídas PGM programáveis ',
            'Aceita até 128 dispositivos sem fio (modulação FSK ou OOK) ',
            'Compatível com receptores sem fio e módulos de comunicação (telefone, IP, GSM, etc.)',
            'Projetada para integração com empresas de monitoramento e centrais de portaria/segurança'
          ]
        },
        {
          id: 'amt-8000-pro',
          label: 'AMT 8000 PRO ',
          img: 'img/portfolio/perimetro/central-intelbras/amt8000.webp',
          title: 'Central de alarme Intelbras AMT 8000 PRO',
          desc: 'Central de altíssimo desempenho para projetos grandes e complexos, como condomínios, indústrias e empreendimentos multi-bloco.',
          features: [
            'Conexão sem fio com Wi-Fi',
            'Circuito de sirene integrado com espelhamento sonoro, dificultando que o intruso localize a sirene  pelo som',
            'Capacidade para 16 partições independentes',
            'Perfeita para integração com CFTV, cerca elétrica, sensores externos e automações',
            'Pensada para projetos monitorados 24h com alto nível de segurança'
          ]
        }
      ]
    },
  {
  id: 'intelbras-cercas',
  label: 'Cercas elétricas',
  subtitle: 'Centrais de cerca elétrica Intelbras ELC para muros e perímetros residenciais, comerciais e grandes projetos.',
  items: [
    {
      id: 'elc-5001',
      label: 'ELC 5001 – cerca elétrica residencial / comercial',
      img: 'img/portfolio/perimetro/cerca-intelbras/elc5001.webp',
      title: 'Central de cerca elétrica Intelbras ELC 5001',
      desc: 'Central de cerca elétrica compacta para residências e pequenos comércios, ideal para muros de porte reduzido com proteção perimetral 24h.',
      features: [
        'Indicada para casas, sobrados e pequenos comércios',
        'Saída de alta tensão pulsativa com baixo consumo',
        'Monitoramento de rompimento, curto e aterramento da cerca',
        'Saída para sirene e interface com central de alarme',
        'Sinalização de status no painel frontal (ligada, disparo, falha)'
      ]
    },
    {
      id: 'elc-5112',
      label: 'ELC 5112 – até 2 setores de cerca',
      img: 'img/portfolio/perimetro/cerca-intelbras/elc5112.webp',
      title: 'Central de cerca elétrica Intelbras ELC 5112',
      desc: 'Central de cerca elétrica com maior flexibilidade de setorização, ideal para imóveis residenciais e comércios que precisam dividir a cerca em áreas independentes.',
      features: [
        'Permite setorização de trechos de cerca (conforme projeto)',
        'Monitoramento contínuo de alta tensão e integridade dos fios',
        'Saída para sirene e comunicação com central de alarme',
        'Bornes dedicados para aterramento correto do sistema',
        'Ajustes de tempo de disparo e potência da cerca'
      ]
    },
    {
      id: 'elc-3012',
      label: 'ELC 3012 – proteção para perímetros médios',
      img: 'img/portfolio/perimetro/cerca-intelbras/elc3012.webp',
      title: 'Central de cerca elétrica Intelbras ELC 3012',
      desc: 'Central de cerca elétrica para perímetros de médio porte, muito utilizada em residências amplas, comércios e pequenos condomínios.',
      features: [
        'Projetada para muros e cercas de maior extensão',
        'Monitoramento de ruptura, curto e aterramento da cerca',
        'Saída de alta tensão com choque pulsativo seguro',
        'Saída auxiliar para sirene e sinalizações',
        'Integração com sistemas de alarme e CFTV'
      ]
    },
    {
      id: 'elc-3020',
      label: 'ELC 3020 – perímetros maiores e comerciais',
      img: 'img/portfolio/perimetro/cerca-intelbras/elc3020.webp',
      title: 'Central de cerca elétrica Intelbras ELC 3020',
      desc: 'Central indicada para projetos de perímetro maior, como galpões, comércios de grande porte e condomínios que precisam de mais alcance de cerca elétrica.',
      features: [
        'Capacidade para linhas de cerca mais extensas',
        'Monitoramento contínuo de alta tensão e falhas de cerca',
        'Saída para sirene de alta potência',
        'Compatível com sensores externos e centrais de alarme',
        'Ajustes de tensão e parâmetros de disparo conforme o projeto'
      ]
    },
    {
      id: 'elc-6012',
      label: 'ELC 6012 – alta capacidade para grandes perímetros',
      img: 'img/portfolio/perimetro/cerca-intelbras/elc6012.webp',
      title: 'Central de cerca elétrica Intelbras ELC 6012',
      desc: 'Central robusta para perímetros extensos, indicada para condomínios, galpões, áreas industriais leves e empreendimentos que exigem maior capacidade de linha.',
      features: [
        'Projetada para grandes perímetros com trechos longos de cerca',
        'Monitoramento de alta tensão, ruptura e aterramento indevido',
        'Saída dedicada para sirene e sinalizações externas',
        'Possibilidade de integração com sistemas de alarme monitorado',
        'Gabinete preparado para ambientes externos (conforme instalação)'
      ]
    },
    {
      id: 'elc-6012-net',
      label: 'ELC 6012 NET – controle via app e Wi-Fi',
      img: 'img/portfolio/perimetro/cerca-intelbras/elc6012net.webp',
      title: 'Central de cerca elétrica Intelbras ELC 6012 NET',
      desc: 'Versão conectada da ELC 6012, com Wi-Fi embarcado para armamento, desarmamento e monitoramento da cerca elétrica direto pelo aplicativo Intelbras. ',
      features: [
        'Conexão Wi-Fi integrada para acesso via aplicativo',
        'Permite armar, desarmar e verificar status pelo celular',
        'Suporte a múltiplas zonas (com e sem fio, conforme modelo)',
        'Monitoramento de alta tensão, AC/DC e bateria dos sensores ',
        'Saída PGM e LED de perímetro para sinalização visual'
      ]
    },
    {
      id: 'elc-5003-high-power',
      label: 'ELC 5003 HIGH POWER – grandes extensões',
      img: 'img/portfolio/perimetro/cerca-intelbras/elc5003.webp',
      title: 'Central de cerca elétrica Intelbras ELC 5003 High Power',
      desc: 'Central High Power para grandes extensões de cerca, ideal para galpões, áreas abertas e projetos que exigem mais energia disponível na linha.',
      features: [
        'Alta capacidade para fios de maior extensão (conforme projeto)',
        'Maior energia por pulso para perímetros extensos',
        'Monitoramento completo de circuito (corte, curto, aterramento)',
        'Saída para sirene de alto rendimento',
        'Integração com centrais de alarme e monitoramento 24h'
      ]
    },
    {
      id: 'xel-5001',
      label: 'XEL 5001 – módulo de expansão',
      img: 'img/portfolio/perimetro/cerca-intelbras/xel5001.webp',
      title: 'Módulo de expansão Intelbras XEL 5001',
      desc: 'Módulo de expansão para centrais de cerca elétrica Intelbras, permitindo ampliar setorização e recursos conforme o projeto. ',
      features: [
        'Expansão de zonas / setorização da cerca (conforme central)',
        'Integração nativa com a linha de centrais ELC',
        'Facilita projetos com múltiplos trechos independentes',
        'Instalação em conjunto com a central em quadro técnico',
        'Solução profissional para condomínios e grandes perímetros'
      ]
    }
  ]
},

            {
               id: 'intelbras-sensores',
  label: 'Sensores / barreiras',
  subtitle: 'Sensores de movimento passivo (IVP) e barreiras ativas Intelbras para proteção interna e perimetral.',
  items: [
    // =========================
    // SENSORES DE MOVIMENTO PASSIVO (IVP)
    // =========================
    {
      id: 'ivp-5000-ld',
      label: 'IVP 5000 LD – interno com fio',
      img: 'img/portfolio/perimetro/sensor-intelbras/ivp5000ld.webp',
      title: 'Sensor de movimento IVP 5000 LD',
      desc: 'Sensor de presença infravermelho passivo com fio para ambientes internos, ideal para salas, corredores e quartos.',
      features: [
        'Tecnologia PIR para detecção de movimento em ambientes internos',
        'Cobertura ampla para proteção de cômodos inteiros',
        'Imunidade a ruídos elétricos e variações de temperatura dentro da faixa especificada',
        'Compatível com centrais de alarme Intelbras',
        'Instalação em parede ou canto, com ajuste de altura'
      ]
    },
    {
      id: 'ivp-5000-smart-ld',
      label: 'IVP 5000 SMART LD – interno sem fio',
      img: 'img/portfolio/perimetro/sensor-intelbras/ivp5000smartld.webp',
      title: 'Sensor de movimento IVP 5000 SMART LD',
      desc: 'Versão sem fio do IVP 5000, indicada para instalações onde se deseja menos cabeamento.',
      features: [
        'Comunicação sem fio com centrais Intelbras compatíveis',
        'Bateria de longa duração com aviso de bateria baixa pela central',
        'Tecnologia PIR com alta sensibilidade e estabilidade',
        'Ideal para retrofit e locais onde não se deseja quebrar parede',
        'Proteção anti-violação (tamper) contra abertura indevida do sensor'
      ]
    },
    {
      id: 'ivp-7000-ex',
      label: 'IVP 7000 EX – externo',
      img: 'img/portfolio/perimetro/sensor-intelbras/ivp7000ex.webp',
      title: 'Sensor de movimento IVP 7000 EX',
      desc: 'Sensor de presença passivo desenvolvido para áreas externas, resistente ao sol, chuva e poeira.',
      features: [
        'Carcaça projetada para uso externo, com vedação contra intempéries',
        'Ajuste de sensibilidade para reduzir disparos falsos',
        'Ângulo de cobertura adequado para muros, varandas e garagens',
        'Compatível com centrais de alarme Intelbras',
        'Indicado para proteção antecipada de acessos externos'
      ]
    },
    {
      id: 'ivp-7000-mw-ex',
      label: 'IVP 7000 MW EX – externo dupla tecnologia',
      img: 'img/portfolio/perimetro/sensor-intelbras/ivp7000mwex.webp',
      title: 'Sensor de movimento IVP 7000 MW EX',
      desc: 'Sensor externo de dupla tecnologia (PIR + micro-ondas), ideal para áreas críticas com grande variação de ambiente.',
      features: [
        'Dupla tecnologia: infravermelho passivo + micro-ondas',
        'Maior imunidade a mudanças bruscas de temperatura e pequenas interferências',
        'Projetado para áreas externas expostas ao clima',
        'Possibilidade de ajustes independentes de cada tecnologia',
        'Recomendado para garagens abertas, jardins e áreas laterais do imóvel'
      ]
    },
    {
      id: 'ivp-1000-pet-smart',
      label: 'IVP 1000 PET SMART – interno pet-imune sem fio',
      img: 'img/portfolio/perimetro/sensor-intelbras/ivp1000petsmart.webp',
      title: 'Sensor de movimento IVP 1000 PET SMART',
      desc: 'Sensor de presença sem fio com tecnologia pet-imune, indicado para ambientes com animais de pequeno porte.',
      features: [
        'Imunidade a animais de pequeno porte (até a massa especificada pelo fabricante)',
        'Comunicação sem fio com centrais Intelbras compatíveis',
        'Redução de falsos disparos em ambientes internos com pets',
        'Design discreto para salas, quartos e corredores',
        'Instalação rápida sem passagem de cabos de sinal'
      ]
    },

    // =========================
    // SENSORES DE BARREIRA ATIVOS (IVA)
    // =========================
    {
      id: 'iva-8040-at',
      label: 'IVA 8040 AT – barreira ativa até 80 m',
      img: 'img/portfolio/perimetro/sensor-intelbras/iva8040at.webp',
      title: 'Barreira infravermelho IVA 8040 AT',
      desc: 'Barreira ativa de infravermelho para proteção perimetral de muros e corredores com longo alcance.',
      features: [
        'Múltiplos feixes IR alinhados para reduzir disparos acidentais',
        'Alcance típico adequado para grandes vãos de muro ou cerca (até dezenas de metros)',
        'Ajuste de alinhamento e sensibilidade para cada instalação',
        'Uso em conjunto com centrais de alarme Intelbras',
        'Indicada para muros de condomínios, paredes externas e corredores longos'
      ]
    },
    {
      id: 'iva-7100-quad',
      label: 'IVA 7100 QUAD – 4 feixes IR',
      img: 'img/portfolio/perimetro/sensor-intelbras/iva7100quad.webp',
      title: 'Barreira infravermelho IVA 7100 QUAD',
      desc: 'Barreira com quatro feixes ativos, aumentando a segurança contra passagem rasteira ou pulando a barreira.',
      features: [
        'Quatro feixes alinhados verticalmente',
        'Maior discriminação de intrusão (necessita corte de múltiplos feixes)',
        'Ajustes de alcance e sensibilidade',
        'Uso recomendado em muros, fachadas e passagens laterais',
        'Integração direta com centrais de alarme e sirenes'
      ]
    },
    {
      id: 'iva-5015-digital',
      label: 'IVA 5015 DIGITAL – barreira compacta',
      img: 'img/portfolio/perimetro/sensor-intelbras/iva5015digital.webp',
      title: 'Barreira infravermelho IVA 5015 DIGITAL',
      desc: 'Barreira digital compacta para pequenos vãos de passagem, ideal para corredores e acessos de garagem.',
      features: [
        'Feixes digitais para maior precisão na detecção',
        'Construção compacta, facilitando instalação discreta',
        'Configuração simples de alcance dentro do projeto',
        'Indicada para garagens cobertas, halls e corredores',
        'Compatível com centrais de alarme Intelbras'
      ]
    },
    {
      id: 'iva-7100-octa',
      label: 'IVA 7100 OCTA – 8 feixes IR',
      img: 'img/portfolio/perimetro/sensor-intelbras/iva7100octa.webp',
      title: 'Barreira infravermelho IVA 7100 OCTA',
      desc: 'Barreira de oito feixes para perímetros com alto nível de segurança e necessidade de maior cobertura vertical.',
      features: [
        'Oito feixes ativos distribuídos verticalmente',
        'Excelente cobertura desde a base até o topo do muro',
        'Redução de falsos disparos causados por pequenos objetos',
        'Projetada para condomínios, indústrias e áreas de alto risco',
        'Integração com centrais de alarme e monitoramento 24 h'
      ]
    },
    {
      id: 'iva-9100-tri',
      label: 'IVA 9100 TRI – barreira de coluna tri-feixe',
      img: 'img/portfolio/perimetro/sensor-intelbras/iva9100tri.webp',
      title: 'Barreira infravermelho IVA 9100 TRI',
      desc: 'Coluna de barreira tri-feixe para proteção perimetral em muros e cercas com múltiplos níveis de detecção.',
      features: [
        'Coluna com múltiplos conjuntos de feixes distribuídos ao longo da altura',
        'Proteção contínua de segmentos maiores de muro ou gradil',
        'Ideal para condomínios, galpões e áreas abertas amplas',
        'Compatível com sistemas de cerca elétrica e alarme',
        'Permite compor perímetros completos com várias colunas em série'
              
                  ]
                }
              ]
            }
          ]
        },
      
    
        // =======================
        // JFL
        // =======================
        {
          id: 'jfl',
          label: 'JFL Alarmes',
          thumb: 'img/portfolio/perimetro/central-jfl/active-8.webp',
          types: [
            {
              id: 'jfl-centrais',
              label: 'Centrais de alarme',
              subtitle: 'Centrais JFL monitoráveis para residências, comércios e projetos maiores.',
              items: [
                {
                  id: 'jfl-active-8',
                  label: 'Active 8 zonas ',
                  img: 'img/portfolio/perimetro/central-jfl/active-8.webp',
                  title: 'Central de alarme JFL – Linha Active (8 zonas)',
                  desc: 'Central monitorável da JFL para pequenos sistemas de alarme, ideal para casas e pequenos comércios.',
                  features: [
                    'Suporte a até 8 zonas (fio ou sem fio, conforme configuração)',
                    'Permite partições e zonas independentes',
                    'Saída para sirene e contato de alarme',
                    'Compatível com sensores JFL e acessórios de alarme',
                    'Opção de monitoramento 24h via empresa especializada'
                  ]
                },
                {
                  id: 'jfl-active-20',
                  label: 'Active 20 zonas ',
                  img: 'img/portfolio/perimetro/central-jfl/active-20.webp',
                  title: 'Central de alarme JFL – Linha Active (20 zonas)',
                  desc: 'Central de médio porte da JFL para residências grandes, empresas ou comércios, com maior capacidade de zonas e flexibilidades.',
                  features: [
                    'Suporte a até 20 zonas misturadas',
                    'Partições independentes para diferentes áreas',
                    'Compatível com sensores com fio e sem fio',
                    'Saída para sirene e relés de acionamento',
                    'Preparada para interface com monitoramento profissional'
                  ]
                }
              ]
            },
            {
              id: 'jfl-cercas',
              label: 'Cercas elétricas',
              subtitle: 'Eletrificadores de cerca JFL para proteção perimetral de muros, gradis e cercas.',
              items: [
                {
                  id: 'jfl-ecr-10W',
                  label: 'ECR 10W (exemplo)',
                  img: 'img/portfolio/perimetro/cerca-jfl/cerca-ecr-10w.webp',
                  title: 'Eletrificador de cerca JFL – Linha ECR 10W',
                  desc: 'Eletrificador básico da JFL para uso residencial, ideal para muros baixos ou trechos curtos de cerca.',
                  features: [
                    'Saída de alta tensão pulsativa para proteção perimetral',
                    'Monitoramento de corte, curto e aterramento da cerca',
                    'Compatível com sirene e central de alarme JFL',
                    'Instalação simples e manutenção fácil',
                    'Indicado para casas e pequenos comércios'
                  ]
                },
                {
                  id: 'jfl-ecr-10',
                  label: 'ECR-10',
                  img: 'img/portfolio/perimetro/cerca-jfl/cerca-ecr-10.webp',
                  title: 'Eletrificador de cerca JFL – Linha ECR-10',
                  desc: 'Eletrificador de maior potência, indicado para perímetros maiores como condomínios ou comércios ampliados.',
                  features: [
                    'Maior potência para malhas de cerca extensas',
                    'Monitoramento completo da cerca (corte, curto, aterramento)',
                    'Saída para sirene e integração com central de alarme',
                    'Ideal para muros altos, cercas longas e proteção perimetral reforçada',
                    'Projetado para uso contínuo e segurança elevada'
                  ]
                },
                  {
                  id: 'jfl-ecr-18i Plus',
                  label: 'ECR-18i Plus',
                  img: 'img/portfolio/perimetro/cerca-jfl/cerca-ecr-18i.webp',
                  title: 'Eletrificador de cerca JFL – Linha -18i Plus',
                  desc: 'Eletrificador de maior potência, indicado para perímetros maiores como condomínios ou comércios ampliados.',
                  features: [
                    'Maior potência para malhas de cerca extensas',
                    'Monitoramento completo da cerca (corte, curto, aterramento)',
                    'Saída para sirene e integração com central de alarme',
                    'Ideal para muros altos, cercas longas e proteção perimetral reforçada',
                    'Projetado para uso contínuo e segurança elevada'
                  ]
                },
                 {
                  id: 'jfl-ecr-18 Plus',
                  label: 'ECR-18 Plus',
                  img: 'img/portfolio/perimetro/cerca-jfl/cerca-ecr-18plus.webp',
                  title: 'Eletrificador de cerca JFL – Linha -18 Plus',
                  desc: 'Eletrificador de maior potência, indicado para perímetros maiores como condomínios ou comércios ampliados.',
                  features: [
                    'Maior potência para malhas de cerca extensas',
                    'Monitoramento completo da cerca (corte, curto, aterramento)',
                    'Saída para sirene e integração com central de alarme',
                    'Ideal para muros altos, cercas longas e proteção perimetral reforçada',
                    'Projetado para uso contínuo e segurança elevada'
                  ]
                }
              ]
            },
            {
               id: 'jfl-sensores',
  label: 'Sensores / barreiras',
  subtitle: 'Sensores e barreiras JFL para detecção de presença, movimento ou rompimento de perímetro.',
  items: [
    // ======================
    // SENSORES INTERNOS
    // ======================
    {
      id: 'jfl-lz-510-black',
      label: 'LZ-510 Black – interno',
      img: 'img/portfolio/perimetro/sensor-jfl/lz-510-black.webp',
      title: 'Sensor de Movimento LZ-510 Black',
      desc: 'Sensor infravermelho passivo para ambientes internos, ideal para salas, quartos, escritórios e pequenos comércios.',
      features: [
        'Aplicação em ambientes internos secos',
        'Tecnologia infravermelho passivo',
        'Alcance e ângulo adequados para áreas internas comuns',
        'Compatível com centrais de alarme JFL',
        'Design discreto em acabamento Black'
      ]
    },
    {
      id: 'jfl-idx-500',
      label: 'IDX-500 – interno',
      img: 'img/portfolio/perimetro/sensor-jfl/idx-500.webp',
      title: 'Sensor de Movimento IDX-500',
      desc: 'Sensor PIR interno com alto nível de imunidade a falsos disparos, indicado para uso residencial e comercial leve.',
      features: [
        'Uso interno em residências, lojas e salas comerciais',
        'Detecção por infravermelho passivo',
        'Ajustes de sensibilidade para redução de falsos alarmes',
        'Compatível com a maioria das centrais JFL',
        'Instalação em parede ou canto do ambiente'
      ]
    },

    // ======================
    // SENSORES EXTERNOS / ÁREA EXTERNA
    // ======================
    {
      id: 'jfl-dse-830i-duo',
      label: 'DSE-830i Duo+ – externo',
      img: 'img/portfolio/perimetro/sensor-jfl/dse-830i-duo.webp',
      title: 'Sensor Externo DSE-830i Duo+',
      desc: 'Sensor de movimento para áreas externas, com dupla tecnologia, ideal para jardins, garagens e áreas de acesso.',
      features: [
        'Projetado para ambientes externos e semiabertos',
        'Dupla tecnologia para maior imunidade a interferências',
        'Alta resistência a intempéries (sol, chuva, vento)',
        'Indicado para muros, frentes de imóveis e garagens',
        'Integração direta com centrais de alarme JFL'
      ]
    },
    {
      id: 'jfl-ird-650-duo',
      label: 'IRD-650 Duo+ – externo',
      img: 'img/portfolio/perimetro/sensor-jfl/ird-650-duo.webp',
      title: 'Sensor Externo IRD-650 Duo+',
      desc: 'Sensor de detecção externa da linha Duo+, indicado para perímetros expostos com necessidade de maior proteção.',
      features: [
        'Aplicação em áreas externas expostas',
        'Dupla tecnologia para diminuir falsos alarmes',
        'Alcance configurável conforme o projeto',
        'Estrutura preparada para intempéries',
        'Ideal para frentes de casas, corredores externos e laterais'
      ]
    },

    // ======================
    // BARREIRAS ATIVAS (LINHA IRA)
    // ======================
    {
      id: 'jfl-ira-50-digital',
      label: 'IRA-50 Digital – barreira até 50 m',
      img: 'img/portfolio/perimetro/sensor-jfl/ira-50-digital.webp',
      title: 'Barreira Ativa IRA-50 Digital',
      desc: 'Barreira infravermelho digital com alcance de até 50 m, ideal para proteção perimetral de muros e passagens.',
      features: [
        'Alcance de até aproximadamente 50 metros (instalação frente a frente)',
        'Múltiplos feixes IR para reduzir disparos acidentais',
        'Aplicação em muros, gradis e corredores externos',
        'Integração direta com centrais de alarme JFL',
        'Indicado para residências e pequenos comércios'
      ]
    },
    {
      id: 'jfl-ira-260-digital',
      label: 'IRA-260 Digital – barreira até 260 m',
      img: 'img/portfolio/perimetro/sensor-jfl/ira-260-digital.webp',
      title: 'Barreira Ativa IRA-260 Digital',
      desc: 'Barreira infravermelho digital de longo alcance, indicada para perímetros maiores como galpões e condomínios.',
      features: [
        'Alcance de até aproximadamente 260 metros (instalação frente a frente)',
        'Ideal para perímetros grandes, como galpões e condomínios',
        'Vários feixes alinhados para detecção mais precisa',
        'Alta imunidade a interferências ambientais',
        'Integração com sistemas de alarme e monitoramento 24h'
                  ]
                }
              ]
            }
          ]
        }
      ] 
    },  

    // =======================
    // REDES & INFRAESTRUTURA
    // =======================
    redes: {
      title: 'Redes & infraestrutura',
      subtitle: 'Escolha o tipo de solução de rede que você quer visualizar.',
      categories: [

 {
  id: 'racks',
  label: 'Racks 19"',
  thumb: 'img/portfolio/redes/rack/rack-piso.webp',
  subtitle: 'Racks padrão 19" de parede, piso e caixas metálicas para organização de CFTV, rede, automação e nobreaks.',
  items: [

    // ======================
    // RACK DE PAREDE
    // ======================
    {
      id: 'rack-parede-19',
      label: 'Rack de parede 19"',
      img: 'img/portfolio/redes/rack/rack-parede.webp',
      title: 'Rack de Parede 19"',
      desc: 'Racks padrão 19" para instalação em parede, ideais para DVRs, NVRs, switches, fontes e organização de cabeamento.',
      features: [
        'Instalação em parede para otimizar espaço',
        'Estrutura em aço com pintura eletrostática anticorrosão',
        'Padrão 19" compatível com switches, patch panels e acessórios',
        'Porta frontal com visor em vidro/acrílico e fechadura de segurança',
        'Passagem de cabos superior e inferior com alívio de tensão',
        'Opção de ventilação superior (cooler) em alguns modelos',
        'Alturas disponíveis (U): 4U, 6U, 9U, 12U, 16U'
      ]
    },

    // ======================
    // RACK DE PISO
    // ======================
    {
      id: 'rack-piso-19',
      label: 'Rack de piso 19"',
      img: 'img/portfolio/redes/rack/rack-piso.webp',
      title: 'Rack de Piso 19"',
      desc: 'Racks de piso padrão 19" para grandes infraestruturas, acomodando DVRs, switches, controladores e nobreaks com segurança.',
      features: [
        'Estrutura reforçada para suportar equipamentos pesados',
        'Portas frontal e traseira para manutenção facilitada',
        'Preparado para ventilação (bandeja de coolers superior)',
        'Organização vertical e horizontal com guias 19"',
        'Rodízios ou sapatas (dependendo do modelo)',
        'Ideal para salas técnicas, TI corporativo, CFTV e automação predial',
        'Alturas disponíveis (U): 16U, 20U, 24U, 28U, 32U, 36U, 40U, 44U'
      ]
    },

    // ======================
    // MINI RACKS E CAIXAS METÁLICAS
    // ======================
    {
      id: 'caixa-metalica',
      label: 'Mini racks e caixas metálicas',
      img: 'img/portfolio/redes/rack/mini-rack.webp',
      title: 'Mini Racks & Caixas Metálicas',
      desc: 'Caixas metálicas e mini racks compactos para pequenos sistemas de CFTV, rede e automação residencial/comercial.',
      features: [
        'Modelos compactos para DVR, switch, fonte ou controladores',
        'Fixação em parede ou embutida (dependendo da caixa)',
        'Estrutura em aço com pintura eletrostática',
        'Fechamento com chave para maior segurança',
        'Organização de cabos discreta e profissional',
        'Opções ventiladas, fechadas ou com visor frontal',
        'Alturas disponíveis variam conforme o modelo (tipicamente 2U, 3U, 4U, 6U)'
      ]
    }
  ]
},

// =======================
// NOBREAKS & FONTES ININTERRUPTAS
// =======================
{
  id: 'nobreaks',
  label: 'Nobreaks & Fontes ininterruptas',
  thumb: 'img/portfolio/redes/nobreak/nobreak-powergate.webp',
  subtitle: 'Nobreaks dedicados para portões, CFTV, rede e controle de acesso, além de fontes ininterruptas.',
  items: [
    {
      id: 'nobreak-powergate-1000',
      label: 'Nobreak PowerGate 1000VA (Portão)',
      img: 'img/portfolio/redes/nobreak/nobreak-powergate.webp',
      title: 'Nobreak PowerGate 1000VA – Portões',
      desc: 'Nobreak projetado para motores de portões automáticos, garantindo funcionamento mesmo na queda de energia.',
      features: [
        '1000VA monovolt específico para motores de portão',
        'Suporta picos de corrente do motor',
        'Autonomia para diversas aberturas sem energia',
        'Proteção contra sobrecarga e surtos',
        'Compatível com PPA, Rossi, Garen e outras marcas'
      ]
    },
    {
      id: 'nobreak-weg-ups-home',
      label: 'WEG UPS Home (CFTV / Rede)',
      img: 'img/portfolio/redes/nobreak/nobreak-weg-home.webp',
      title: 'WEG UPS Home – 600 / 800 / 1200VA',
      desc: 'Nobreak line-interactive da WEG para DVRs, NVRs, switches, roteadores e automação.',
      features: [
        'Topologia line-interactive com regulação automática',
        'Modelos 600, 800 e 1200VA',
        'Proteção contra picos e quedas de energia',
        'Autonomia para manter CFTV e rede ativos',
        'Operação silenciosa e de alta durabilidade'
      ]
    },
    {
      id: 'intelbras-fa-1220s',
      label: 'Fonte Ininterrupta Intelbras FA 1220 S',
      img: 'img/portfolio/redes/nobreak/intelbras-fa1220s.webp',
      title: 'Fonte Ininterrupta Intelbras FA 1220 S',
      desc: 'Fonte ininterrupta profissional Intelbras, ideal para CFTV, controle de acesso, alarmes e automação.',
      features: [
        'Saída estabilizada 12,8 V / 2 A',
        'Bateria interna com comutação automática',
        'Proteção contra surtos e curto-circuito',
        'Indicada para câmeras, roteadores, fechaduras e centrais',
        'Mantém o sistema funcionando mesmo sem energia da rede'
      ]
    },
    {
      id: 'idpower-controlid',
      label: 'iDPower – Control iD',
      img: 'img/portfolio/redes/nobreak/idpower.webp',
      title: 'Fonte Ininterrupta iDPower – Control iD',
      desc: 'Fonte com bateria integrada para manter controladores de acesso funcionando mesmo na falta de energia.',
      features: [
        'Compatível com iDAccess, iDFace, iDFlex e linha Control iD',
        'Saída 12 V estabilizada',
        'Bateria interna com autonomia para horas de operação',
        'Evita travamento de portas e falhas de leitura',
        'Instalação simplificada junto ao controlador de acesso'
      ]
    },
    {
      id: 'fc-fontes-ininterruptas',
      label: 'Fontes ininterruptas FC (12V 2A / 3A / 5A)',
      img: 'img/portfolio/redes/nobreak/fc-12v5a.webp',
      title: 'Fontes Ininterruptas FC – 12 V 2A / 3A / 5A',
      desc: 'Linha de fontes ininterruptas FC para controle de acesso, CFTV e automação, com saída 12 V estabilizada e bateria interna.',
      features: [
        'Modelos 12 V – 2 A (24 W), 3 A (36 W) e 5 A (60 W)',
        'Bateria interna com comutação automática na falta de energia',
        'Proteção contra curto-circuito, sobrecarga e inversão de polaridade',
        'Carregador inteligente que preserva a vida útil da bateria',
        'Ideais para fechaduras eletromagnéticas, controladores de acesso, roteadores e pequenos DVRs'
      ]
    }
  ]
},


        // =======================
        // SWITCHES
        // =======================
        {
          id: 'switches',
          label: 'Switches de rede',
          thumb: 'img/portfolio/redes/switch/switch-weg.webp',
          subtitle: 'Switches para distribuição de rede em CFTV, Wi-Fi e automação.',
          items: [
            {
              id: 'switch-weg-8p',
              label: 'Switch WEG 8 portas',
              img: 'img/portfolio/redes/switch/switch-weg.webp',
              title: 'Switch WEG 8 portas',
              desc: 'Switch de 8 portas para redes de pequeno e médio porte, ideal para interligar DVR/NVR, roteadores e pontos de acesso Wi-Fi.',
              features: [
                '8 portas Ethernet para até 8 equipamentos',
                'Instalação plug-and-play',
                'Baixo consumo de energia',
                'Formato compacto para uso em rack ou prateleira',
                'Perfeito para redes de CFTV e automação residencial/comercial'
              ]
            },
            {
              id: 'switch-weg-16p',
              label: 'Switch WEG 16 portas',
              img: 'img/portfolio/redes/switch/switch-weg16.webp',
              title: 'Switch WEG 16 portas',
              desc: 'Switch com 16 portas para projetos maiores, como condomínios, lojas e empresas que precisam de mais pontos de rede.',
              features: [
                '16 portas Ethernet para múltiplos dispositivos',
                'Ideal para concentrar câmeras IP, NVRs e access points',
                'Instalação simples e silenciosa',
                'Pode ser instalado em rack 19" com suporte adequado',
                'Boa solução para backbone de rede de CFTV e Wi-Fi'
              ]
            }
          ]
        },

        // =======================
        // ROTEADORES WI-FI EMPRESARIAL
        // =======================
        {
          id: 'roteadores',
          label: 'Roteadores Wi-Fi empresarial',
          thumb: 'img/portfolio/redes/roteador/roteador-ap310.webp',
          subtitle: 'Roteadores e access points empresariais Intelbras para Wi-Fi profissional.',
          items: [
            {
              id: 'intelbras-ap310',
              label: 'Roteador Empresarial Intelbras AP 310',
              img: 'img/portfolio/redes/roteador/roteador-ap310.webp',
              title: 'Roteador / Access Point Empresarial Intelbras AP 310',
              desc: 'Access point de teto corporativo, ideal para profissionalizar o Wi-Fi de pousadas, pequenas empresas e escritórios, com cobertura aproximada de até 200 m² e cerca de 100 usuários conectados por AP. ',
              features: [
                'Cobertura aproximada de até 200 m² por AP ',
                'Suporta cerca de 100 usuários simultâneos por access point ',
                'Gerenciamento centralizado em nuvem (WiseFi / inMaster)',
                'Até 8 SSIDs com VLAN e segurança corporativa',
                'Recurso de Wi-Fi marketing (Facebook Wi-Fi, splash page)'
              ]
            },
            {
              id: 'intelbras-ap1350',
              label: 'Roteador Empresarial Intelbras AP 1350 AC-S',
              img: 'img/portfolio/redes/roteador/roteador-ap1350.webp',
              title: 'Roteador Empresarial Intelbras AP 1350 AC-S',
              desc: 'Roteador / access point empresarial de alta capacidade, com Wi-Fi até 1350 Mbps, alcance aproximado de até 350 m² e suporte para centenas de usuários simultâneos, ideal para redes corporativas mais exigentes. ',
              features: [
                'Velocidade Wi-Fi de até 1350 Mbps (dual band AC) ',
                'Alcance aproximado de até 350 m² por AP ',
                'Capacidade para até ~350 usuários conectados com estabilidade ',
                'Funções corporativas como Fast Roaming, MU-MIMO e Beamforming ',
                'Perfeito para empresas, coworkings e ambientes de alta densidade de dispositivos'
              ]
            }
          ]
        }

      ]
    },
interfonia: {
  title: 'Interfonia & Vídeoporteiro',
  subtitle: 'Soluções para residências e condomínios com comunicação clara e abertura segura.',
  categories: [

    // ==========================================================
    // 1) CATEGORIA RESIDENCIAL – VÍDEOPORTEIROS INTELBRAS
    // ==========================================================
    {
      id: 'interfonia-residencial',
      label: 'Vídeo porteiro residencial',
      thumb: 'img/portfolio/interfonia/residencial/iv4010.webp',
      subtitle: 'Vídeoporteiros Intelbras para casas, sobrados e pequenos comércios.',
      items: [

        {
          id: 'intelbras-iv-linha',
          label: 'Linha IV (IV 4010 / 7010 / 2020)',
          img: 'img/portfolio/interfonia/residencial/iv4010.webp',
          title: 'Linha Intelbras IV – Vídeoporteiros residenciais',
          desc: 'A linha IV da Intelbras oferece vídeoporteiros com excelente qualidade de imagem, abertura de portas e possibilidade de adicionar câmeras externas.',
          features: [
            'Monitores de 4,3" até 7"',
            'Visualização do visitante antes do atendimento',
            'Abertura de fechadura elétrica ou eletroímã',
            'Compatível com câmeras adicionais (modelos 7010 e 7010 HD)'
           
          ]
        },

          {
            id: 'videoporteiro-allo-wt7',
            label: 'Intelbras Allo WT7',
            img: 'img/portfolio/interfonia/residencial/allo-wt7.webp',
            title: 'Vídeoporteiro Wi-Fi Intelbras Allo WT7',
            desc: 'Vídeoporteiro smart com tela touchscreen de 7", conexão Wi-Fi e atendimento pelo aplicativo Allo Intelbras, permitindo visualizar e liberar o acesso de qualquer lugar.',
            features: [
              'Tela touchscreen de 7" com interface moderna e intuitiva',
              'Atendimento remoto via app Allo Intelbras (Android e iOS)',
              'Imagem em alta definição com visão noturna infravermelha',
              'Conexão Wi-Fi ou cabo (Ethernet) para maior estabilidade',
              'Gravação de chamadas e registros de visitantes',
              'Abertura de fechaduras elétricas, eletroímãs e portões',
              'Comunicação full duplex com áudio claro e sem ruídos',
              'Compatível com múltiplos dispositivos móveis da família',
              'Design slim, ideal para residências modernas e alto padrão'
            ]
          }


      ]
    },

    // ==========================================================
    // 2) CATEGORIA CONDOMÍNIO – COMUNICAÇÃO PREDIAL INTELBRAS
    // ==========================================================
{
  id: 'interfonia-condominio-intelbras',
  label: 'Interfonia condominial Intelbras',
  thumb: 'img/portfolio/interfonia/condominio/comunic.webp',
  subtitle: 'Comunicação clara entre portaria e apartamentos, com centrais, terminais dedicados e módulos coletivos.',
  items: [
    {
  id: 'intelbras-comunic',
  label: 'Linha Comunic (8 / 16 / 48)',
  img: 'img/portfolio/interfonia/condominio/comunic.webp',
  title: 'Centrais de Comunicação Intelbras – Linha Comunic',
  desc: 'A linha Comunic da Intelbras reúne centrais condominiais projetadas para interligar portaria, apartamentos, guarita e áreas internas com comunicação clara, segura e sem necessidade de linha telefônica.',
  features: [
    'Modelos disponíveis: Comunic 8, Comunic 16 e Comunic 48',
    'Gerenciamento de comunicação entre portaria, apartamentos e guarita',
    'Não utiliza linha telefônica para operar (rede dedicada entre os ramais)',
    'Compatível com terminais dedicados e porteiros coletivos Intelbras',
    'Design projetado para facilitar cabeamento e manutenção',
    'Função de sigilo entre ramais, garantindo conversas privadas',
    'Permite chamadas internas, transferência e sinalização para portaria',
    'Bornes identificados, facilitando instalação e futuras expansões',
    'Indicado para condomínios residenciais, comerciais e conjuntos horizontais',
    'Permite comando de abertura de portas/portões integrado ao sistema'
  ]
},

    {
      id: 'intelbras-centrais-coletivas',
      label: 'Centrais coletivas (linha Collective)',
      img: 'img/portfolio/interfonia/condominio/coletiva.webp',
      title: 'Centrais coletivas Intelbras',
      desc: 'Módulos que fazem a distribuição de áudio entre o painel externo, a central e os apartamentos, organizando o cabeamento e a setorização por bloco ou torre.',
      features: [
        'Distribuição organizada das linhas para vários apartamentos ou blocos',
        'Compatíveis com porteiros coletivos e centrais de comunicação Intelbras',
        'Modelos com diferentes capacidades para ajustar ao tamanho do condomínio',
        'Instalação em rack ou painel técnico com bornes identificados',
        'Facilitam manutenção, expansões futuras e organização da infraestrutura'
      ]
    }
  ]
}

  ]
},

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

  // >>> FUNÇÃO OPEN ATUALIZADA PARA CATEGORIAS, MARCAS (PERÍMETRO) E ITENS SIMPLES <<<
  function open(catKey){
    const catData = DATA[catKey];
    if (!catData) {
      return;
    }

    const hasCategories = Array.isArray(catData.categories);
    const hasBrands = Array.isArray(catData.brands);

    // Limpa detalhes atuais
    imgEl.src = '';
    imgEl.alt = '';
    itemTitleEl.textContent = '';
    itemDescEl.textContent = '';
    featuresEl.innerHTML = '';

    titleEl.textContent = catData.title || '';
    subtitleEl.textContent = catData.subtitle || '';

    listEl.innerHTML = '';
    listEl.classList.remove('service-modal__list--grid');

    // =======================
    // 1) SERVIÇOS COM MARCAS (ALARME & PERÍMETRO)
    // =======================
    if (hasBrands) {
      listEl.classList.add('service-modal__list--grid');

      const showBrandTypes = (brand) => {
        listEl.classList.remove('service-modal__list--grid');
        listEl.innerHTML = '';

        // Botão voltar para lista de marcas
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'service-modal__option service-modal__option--back';
        backBtn.textContent = '← Voltar para marcas de ' + (catData.title || 'serviço');
        backBtn.addEventListener('click', () => open(catKey));
        listEl.appendChild(backBtn);

        subtitleEl.textContent = brand.subtitle || catData.subtitle || '';

        (brand.types || []).forEach((type) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'service-modal__option';
          btn.textContent = type.label || 'Opção';
          btn.addEventListener('click', () => showTypeItems(brand, type));
          listEl.appendChild(btn);
        });
      };

      const showTypeItems = (brand, type) => {
        listEl.classList.remove('service-modal__list--grid');
        listEl.innerHTML = '';

        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'service-modal__option service-modal__option--back';
        backBtn.textContent = '← Voltar para ' + (brand.label || 'marcas');
        backBtn.addEventListener('click', () => showBrandTypes(brand));
        listEl.appendChild(backBtn);

        subtitleEl.textContent =
          type.subtitle || brand.subtitle || catData.subtitle || '';

        let firstBtn = null;
        (type.items || []).forEach((item, index) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'service-modal__option';
          btn.textContent = item.label || item.title || 'Opção';
          btn.addEventListener('click', () => {
            listEl
              .querySelectorAll('.service-modal__option')
              .forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            renderItem(item);
          });
          listEl.appendChild(btn);
          if (index === 0) firstBtn = btn;
        });

        if (firstBtn) firstBtn.click();
      };

      // Tela inicial: marcas (Intelbras / JFL)
      (catData.brands || []).forEach((brand) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'service-modal__category';
        btn.innerHTML = `
          <div class="service-modal__category-thumb">
            <img src="${brand.thumb || ''}" alt="${brand.label || ''}">
          </div>
          <div class="service-modal__category-title">${brand.label || ''}</div>
        `;
        btn.addEventListener('click', () => showBrandTypes(brand));
        listEl.appendChild(btn);
      });

      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      return;
    }

    // =======================
    // 2) SERVIÇOS COM CATEGORIAS (CFTV, CONTROLE DE ACESSO, AUTOMAÇÃO)
    // =======================
    if (hasCategories) {
      listEl.classList.add('service-modal__list--grid');

      const showCategoryItems = (category) => {
        listEl.classList.remove('service-modal__list--grid');
        listEl.innerHTML = '';

        // Botão voltar para categorias do mesmo serviço
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'service-modal__option service-modal__option--back';
        backBtn.textContent =
          '← Voltar para categorias de ' + (catData.title || 'serviço');
        backBtn.addEventListener('click', () => open(catKey));
        listEl.appendChild(backBtn);

        subtitleEl.textContent = category.subtitle || catData.subtitle || '';

        let firstBtn = null;
        (category.items || []).forEach((item, index) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'service-modal__option';
          btn.textContent = item.label || item.title || 'Opção';
          btn.addEventListener('click', () => {
            listEl
              .querySelectorAll('.service-modal__option')
              .forEach((b) => b.classList.remove('is-active'));
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

    // =======================
    // 3) SERVIÇOS SIMPLES COM LISTA DIRETA DE ITENS (REDES, INTERFONIA, ETC.)
    // =======================
    let firstBtn = null;

    (catData.items || []).forEach((item, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'service-modal__option';
      btn.textContent = item.label || item.title || 'Opção';
      btn.addEventListener('click', () => {
        listEl
          .querySelectorAll('.service-modal__option')
          .forEach((b) => b.classList.remove('is-active'));
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
// Slider avançado com vídeos (play/pause) e dots automáticos
document.addEventListener('DOMContentLoaded', () => {

  const sliderTrack = document.querySelector('.hero-slider__track');
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dotsContainer = document.querySelector('.hero-slider__dots');

  if (!sliderTrack || slides.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let timer = null;
  const delay = 5000; // tempo entre os slides (ms)

  // --- CRIAR DOTS AUTOMATICAMENTE ---
  dotsContainer.innerHTML = "";
  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.dataset.index = index;

    if (index === 0) dot.classList.add("is-active");

    dot.addEventListener("click", () => {
      currentIndex = index;
      goToSlide(currentIndex, true);
    });

    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll("button"));


  // --- CONTROLE DE VÍDEO ---
  function pauseAllVideos() {
    slides.forEach(slide => {
      const video = slide.querySelector("video");
      if (video) {
        video.pause();
        video.currentTime = 0; // reseta para sempre iniciar zerado
      }
    });
  }

  function playActiveVideo(index) {
    const video = slides[index].querySelector("video");
    if (video) {
      video.play().catch(() => {});
    }
  }


  // --- TROCAR DE SLIDE ---
  function goToSlide(index, manual = false) {
    currentIndex = (index + slides.length) % slides.length;

    // trocar slide visível
    slides.forEach((slide, i) =>
      slide.classList.toggle("is-active", i === currentIndex)
    );

    // trocar dots ativos
    dots.forEach((dot, i) =>
      dot.classList.toggle("is-active", i === currentIndex)
    );

    // controlar vídeos
    pauseAllVideos();
    playActiveVideo(currentIndex);

    // resetar timer automático
    resetTimer();
  }


  // --- TIMER AUTOMÁTICO ---
  function resetTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      goToSlide(currentIndex);
    }, delay);
  }


  // --- INICIAR SLIDER ---
  goToSlide(0);

});
