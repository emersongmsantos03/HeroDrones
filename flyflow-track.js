// Envia ao FlyFlow os cliques nos contatos, sem dados pessoais do visitante.
(function () {
  var endpoint = 'https://flyflow.herodronecwb.workers.dev/t/event'
  var send = function (name) {
    var body = JSON.stringify({ name: name, path: location.pathname })
    if (navigator.sendBeacon) navigator.sendBeacon(endpoint, body)
    else fetch(endpoint, { method: 'POST', body: body, keepalive: true }).catch(function () {})
  }
  var nameFor = function (link) {
    var marked = link.getAttribute('data-track')
    if (marked) return marked
    var href = link.getAttribute('href') || ''
    if (/wa\.me|whatsapp/i.test(href)) return 'whatsapp'
    if (/^mailto:/i.test(href)) return 'email'
    if (/^tel:/i.test(href)) return 'telefone'
    if (/instagram\.com/i.test(href)) return 'instagram'
    if (/youtube\.com|youtu\.be/i.test(href)) return 'youtube'
    if (/facebook\.com/i.test(href)) return 'facebook'
    if (/loja\.herodrone/i.test(href)) return 'loja'
    if (/contato\.html/i.test(href)) return 'proposta'
    return ''
  }
  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a, [data-track]') : null
    var name = link ? nameFor(link) : ''
    if (name) send(name)
  }, true)
  document.addEventListener('submit', function () { send('formulario') }, true)
})()
