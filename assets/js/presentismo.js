$('a#soloErrores').click(function(e) {
  e.stopImmediatePropagation();
  e.preventDefault();
  if ($(this).parent().hasClass("active")) {
    $(this).parent().removeClass("active");
    $('div#pendientes table.table tr:has(td:last-child span.text-success)').show();
  } else {
    $(this).parent().addClass("active");
    $('div#pendientes table.table tr:has(td:last-child span.text-success)').hide();
  }
  showHideLabels();
});

function showHideLabels() {
  var last = '';
  $('div#pendientes table.table tr td:first-child').each(function(i,elem) {
    if ($(elem).parent().is(':visible')) {
      if ($(elem).text() == last) {
        $(elem).addClass("invisible");
      } else {
        $(elem).removeClass("invisible");
        last = $(elem).text();
      }
    }
  });
}
showHideLabels();

var $root = $('html, body');
$('a').click(function() {
    var href = $.attr(this, 'href');
    $root.animate({
        scrollTop: $(href).offset().top
    }, 500, function () {
        window.location.hash = href;
    });
    return false;
});
