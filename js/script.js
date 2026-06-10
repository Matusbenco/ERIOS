(function(){
  var b=document.getElementById('burger'),n=document.getElementById('navLinks');
  if(b&&n){b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o);});
  n.addEventListener('click',function(e){if(e.target.tagName==='A')n.classList.remove('open');});}
})();
(function(){
  var els=document.querySelectorAll('[data-rise]');
  if(!('IntersectionObserver' in window)){els.forEach(function(el){el.classList.add('in');});return;}
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(el){io.observe(el);});
})();

/* Kontaktný formulár — odoslanie cez Formspree (AJAX, bez opustenia stránky) */
(function(){
  var f=document.getElementById('eriosForm');
  if(!f) return;
  var statusEl=document.getElementById('formStatus'),
      btn=document.getElementById('formSubmit');
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!f.checkValidity()){f.reportValidity();return;}
    statusEl.className='form-status';
    var orig=btn.innerHTML;
    btn.disabled=true; btn.textContent='Odosielam…';
    fetch(f.action,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}})
    .then(function(r){
      if(r.ok){
        f.reset();
        statusEl.textContent='Ďakujeme. Vaša správa bola odoslaná — ozveme sa vám čo najskôr.';
        statusEl.classList.add('show','ok');
      }else{
        return r.json().then(function(d){
          var msg=(d&&d.errors)?d.errors.map(function(x){return x.message;}).join(', ')
                  :'Správu sa nepodarilo odoslať. Skúste to znova alebo nám napíšte e-mailom.';
          statusEl.textContent=msg; statusEl.classList.add('show','err');
        });
      }
    })
    .catch(function(){
      statusEl.textContent='Nastala chyba pripojenia. Skúste to znova alebo nám napíšte e-mailom.';
      statusEl.classList.add('show','err');
    })
    .finally(function(){ btn.disabled=false; btn.innerHTML=orig; });
  });
})();

/* Cookie / chat upozornenie */
(function(){
  var n=document.getElementById('cookieNotice'), ok=document.getElementById('cookieOk');
  if(!n) return;
  try{ if(localStorage.getItem('erios_cookie_ok')==='1') return; }catch(e){}
  n.hidden=false;
  if(ok){ok.addEventListener('click',function(){
    n.classList.add('hide');
    try{localStorage.setItem('erios_cookie_ok','1');}catch(e){}
  });}
})();