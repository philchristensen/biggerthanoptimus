/*
 * biggerthanoptimus
 * by Phil Christensen <phil@bubblehouse.org>
 * see LICENSE for details
 */
(function($){
	var API_URL = 'https://en.wikipedia.org/w/api.php';
	
	function parseArticle(data){
		return {
			title: data.parse.title,
			wordcount: evaluateArticle(data.parse.text['*'])
		};
	}
	
	function evaluateArticle(html){
		var wordcount = 0;
		$(html).find('p').each(function(p){
			var code = $(p).html();
			var words = code.replace(/(<([^>]+)>)/ig,"").split(' ');
			wordcount = wordcount + words.length;
		});
		return wordcount;
	}
	
	function getArticle(query, callback){
		var url = API_URL + '?action=parse&page=' + encodeURIComponent(query) + '&format=json';
		$.ajax(url, {
			dataType: 'jsonp',
			success: function(data, textStatus, jqXHR){
				displayWinner(parseArticle(data));
			},
			error: function(jqXHR, textStatus, errorThrown){
				displayWinner(textStatus);
			}
		});
	}
	
	function displayWinner(article){
		$('#result-box').html(article);
	}
	
	$(document).ready(function(){
		$('form').submit(function(){
			var champion = $('#champion').val();
			var challenger = $('#challenger').val();
			
			getArticle(champion, function(champion){
				getArticle(challenger, function(challenger){
					if(champion.wordcount > challenger.wordcount){
						displayWinner(champion);
					}
					else if(champion.wordcount > challenger.wordcount){
						displayWinner(challenger);
					}
					else{
						alert('unbelievable: a tie.');
					}
				});
			});
			
			return false;
		});
	});
})(jQuery);