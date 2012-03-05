/*
 * biggerthanoptimus
 * by Phil Christensen <phil@bubblehouse.org>
 * see LICENSE for details
 */
(function($){
	var API_URL = 'https://en.wikipedia.org/w/api.php';
	
	function parseArticle(data){
		var articleText = data.parse.text['*'];
		var wordcount = 0;
		
		var html = $(articleText);
		html.filter('p').each(function(){
			var code = $(this).html();
			var words = code.replace(/(<([^>]+)>)/ig,"").split(' ');
			wordcount = wordcount + words.length;
		});
		
		var stripped = $.trim(articleText.replace(/(<([^>]+)>)/ig,""));
		var excerpt = stripped.substring(0, 100);
		var redirect = null;
		if(excerpt.indexOf('REDIRECT') == 0){
			redirect = stripped.substring(9, excerpt.indexOf('\n'));
		}
		return {
			title: data.parse.title,
			wordcount: wordcount,
			excerpt: excerpt,
			redirect: redirect,
		};
	}
	
	function getArticle(query, callback){
		var url = API_URL + '?action=parse&page=' + encodeURIComponent(query) + '&format=json';
		$.ajax(url, {
			dataType: 'jsonp',
			success: function(data, textStatus, jqXHR){
				var article = parseArticle(data);
				if(article.redirect){
					getArticle(article.redirect, callback);
				}
				else{
					callback(article);
				}
			},
			error: function(jqXHR, textStatus, errorThrown){
				callback(textStatus);
			}
		});
	}
	
	function displayWinner(winner, loser){
		var box = $('#result-box');
		box.empty();
		box.append($('<h3>In a Wikipedia matchup</h3>'));
		box.append($('<h1>' + winner.title + '</h1>'));
		box.append($('<h3>clocks in at ' + winner.wordcount + ' words, beating out</h3>'));
		box.append($('<h2>' + loser.title + '</h2>'));
		box.append($('<h3>with only ' + loser.wordcount + ' words.</h3>'));
	}
	
	function startSpinner(spinner){
		
	}
	
	function stopSpinner(spinner){
		
	}
	
	$(document).ready(function(){
		$('form').submit(function(){
			var champion = $('#champion').val();
			var challenger = $('#challenger').val();
			
			getArticle(champion, function(champion){
				getArticle(challenger, function(challenger){
					if(champion.wordcount > challenger.wordcount){
						displayWinner(champion, challenger);
					}
					else if(champion.wordcount < challenger.wordcount){
						displayWinner(challenger, champion);
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