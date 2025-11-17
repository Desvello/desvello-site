
// Defensive: force-hide lightbox on load (prevents overlay stuck)
document.addEventListener('DOMContentLoaded', ()=>{
  const lb = document.getElementById('lightbox');
  if(lb) lb.hidden = true;
});

document.addEventListener('DOMContentLoaded',()=>{if(window.lucide)lucide.createIcons();document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{const t=a.getAttribute('href'),o=document.querySelector(t);o&&(e.preventDefault(),o.scrollIntoView({behavior:'smooth',block:'start'}),mobileMenu.classList.remove('open'))})});const e=document.querySelector('.nav-toggle');window.mobileMenu=document.getElementById('mobileMenu');e&&e.addEventListener('click',()=>{mobileMenu.classList.toggle('open')})});(function(){const e=new URLSearchParams(window.location.search).get('admin')==='1',t=document.querySelector('.cases-controls'),o=document.getElementById('testimonials'),n=document.getElementById('toggleEdit'),a=document.getElementById('editPanel'),d=document.getElementById('testimonialForm'),l=document.getElementById('tNome'),c=document.getElementById('tCargo'),s=document.getElementById('tTexto'),i=document.getElementById('tIndex'),r=document.getElementById('cancelEdit'),m=document.getElementById('exportTestimonials'),p=document.getElementById('importFile');function g(){return[{nome:'Síndico (Condomínio X)',cargo:'',texto:'A Desvello resolveu nosso controle de acesso rapidamente e com transparência.'},{nome:'Gestor Predial',cargo:'Bloco Alpha',texto:'Projeto de CFTV bem dimensionado, sem gastos desnecessários.'},{nome:'Comércio Local',cargo:'Brasília/DF',texto:'Instalação organizada e suporte pós-obra excelente.'}]}function u(){try{return JSON.parse(localStorage.getItem('desvello_testimonials_v1'))||g()}catch(e){return g()}}function h(e){localStorage.setItem('desvello_testimonials_v1',JSON.stringify(e))}function v(){if(!o)return;const e=u();o.innerHTML=e.map((t,n)=>'<div class="card"><p>'+b(t.texto)+'</p><div class="caption">'+b(t.nome+(t.cargo?' — '+t.cargo:''))+'</div>'+(S?'<div class="t-actions" data-i="'+n+'"><button class="btn btn-outline t-edit" type="button">Editar</button><button class="btn t-del" type="button">Excluir</button></div>':'')+'</div>').join('')}function b(e){return e.replace(/[&<>"']/g,(e=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[e])))}const S=e; t&&(t.style.display=S?'':'none'),S&&n&&n.addEventListener('click',(()=>{a.hidden=!a.hidden})),S&&d&&d.addEventListener('submit',(e=>{e.preventDefault();const t=parseInt(i.value,10),n={nome:l.value.trim(),cargo:c.value.trim(),texto:s.value.trim()};if(!n.nome||!n.texto)return;const a=u();t>=0&&t<a.length?a[t]=n:a.push(n),h(a),i.value=-1,d.reset(),v(),alert('Depoimento salvo!')})),S&&r&&r.addEventListener('click',(()=>{i.value=-1,d.reset()})),S&&o&&o.addEventListener('click',(e=>{const t=e.target.closest('button');if(!t)return;const n=t.closest('.t-actions');if(!n)return;const a=parseInt(n.getAttribute('data-i'),10),d=u();if(t.classList.contains('t-edit')){const e=d[a];l.value=e.nome,c.value=e.cargo||'',s.value=e.texto,i.value=a,a.hidden&&(a.hidden=!1),window.scrollTo({top:a.getBoundingClientRect().top+window.scrollY-100,behavior:'smooth'})}else t.classList.contains('t-del')&&confirm('Excluir este depoimento?')&&(d.splice(a,1),h(d),v())})),S&&m&&m.addEventListener('click',(()=>{const e=new Blob([JSON.stringify(u(),null,2)],{type:'application/json'}),t=URL.createObjectURL(e),o=document.createElement('a');o.href=t,o.download='depoimentos.json',o.click(),URL.revokeObjectURL(t)})),S&&p&&p.addEventListener('change',(async()=>{const e=p.files[0];if(!e)return;const t=await e.text();try{const e=JSON.parse(t);Array.isArray(e)?(h(e),v(),alert('Importado com sucesso!')):alert('Arquivo inválido: esperado um array JSON.')}catch(e){alert('Não foi possível ler o JSON.')}p.value=''})),v()})();

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
