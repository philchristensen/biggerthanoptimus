/*
 * biggerthanoptimus
 * by Phil Christensen <phil@bubblehouse.org>
 * see LICENSE for details
 */
(function($){
	var API_URL = 'https://en.wikipedia.org/w/api.php';
	
	function parseArticle(data){
		var title = '';
		var articleText = null;
		var html = '';
		var wordcount = 0;
		var redirect = null;
		var excerpt = '';
		var error = '';
		if(data.error){
			error = data.error.code;
		}
		
		if(data.parse){
			title = data.parse.title;
			articleText = data.parse.text['*'];
			html = $(articleText);
			html.filter('p').each(function(){
				var code = $(this).html();
				var words = code.replace(/(<([^>]+)>)/ig,"").split(' ');
				wordcount = wordcount + words.length;
			});
		
			var stripped = $.trim(articleText.replace(/(<([^>]+)>)/ig,""));
			excerpt = stripped.substring(0, 100);
			redirect = null;
			if(excerpt.indexOf('REDIRECT') == 0){
				redirect = stripped.substring(9, excerpt.indexOf('\n'));
			}
		
			var url = null;
			for(index in data.parse.sections){
				var section = data.parse.sections[index];
				url = 'http://en.wikipedia.org/wiki/' + section.fromtitle
				break;
			}
			
			for(var index in data.parse.categories){
				var category = data.parse.categories[index];
				if(category['*'] == 'Disambiguation_pages'){
					error = 'disambiguation';
				}
			}
		}
		
		return {
			title: title,
			url: url,
			error: error,
			wordcount: wordcount,
			excerpt: excerpt,
			redirect: redirect,
		};
	}
	
	function getArticle(query, callback, errback){
		var url = API_URL + '?action=parse&page=' + encodeURIComponent(query) + '&format=json';
		$.ajax(url, {
			dataType: 'jsonp',
			success: function(data, textStatus, jqXHR){
				var article = parseArticle(data);
				if(article.redirect){
					getArticle(article.redirect, callback);
				}
				else if(article.error){
					errback(article.error, article);
					return;
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
		box.append($('<h3>In a Wikipedia matchup</h3>'));
		box.append($('<h1><a href="' + winner.url + '" target="_blank">' + winner.title + '</a></h1>'));
		box.append($('<h3>clocks in at ' + winner.wordcount + ' words, beating out</h3>'));
		box.append($('<h2><a href="' + loser.url + '" target="_blank">' + loser.title + '</a></h2>'));
		box.append($('<h3>with only ' + loser.wordcount + ' words.</h3>'));
		box.append($('<span class="st_facebook_hcount" displayText="Facebook"></span>'));
		box.append($('<span class="st_twitter_hcount" displayText="Tweet"></span>'));
		box.append($('<span class="st_plusone_hcount" displayText="Google +1"></span>'));
	}
	
	var colors = ["#e8161b", "#e5191f", "#e21c23", "#de1f26", "#db222a", "#d8252e",
		"#d52832", "#d22b36", "#cf2e3a", "#cb303d", "#c83341", "#c53645", "#c23949",
		"#bf3c4d", "#bb3f50", "#b84254", "#b54558", "#b2485c", "#af4b60", "#ac4e64",
		"#a85167", "#a5546b", "#a2576f", "#9f5a73", "#9c5d77", "#985f7a", "#95627e",
		"#926582", "#8f6886", "#8c6b8a", "#886e8d", "#857191", "#827495", "#7f7799",
		"#7c7a9d", "#797da1", "#7580a4", "#7283a8", "#6f86ac", "#6c89b0", "#698cb4",
		"#658eb7", "#6291bb", "#5f94bf", "#5c97c3", "#599ac7", "#569dcb", "#52a0ce",
		"#4fa3d2", "#4ca6d6"
	];
	function startSpinner(spinner, color){
		if((! color) || color > colors.length - 1){
			color = 0;
		}
		$(spinner).html('searching');
		$(spinner).animate({backgroundColor: colors[color]}, {
			duration: 0.1,
			complete: function(){
				if($(spinner).html() != 'do it!'){
					startSpinner(spinner, color + 1);
				}
				else{
					$(spinner).css('backgroundColor', '#000');
				}
			}
		})
	}
	
	function stopSpinner(spinner){
		$(spinner).html('do it!');
	}
	
	function championError(type, article){
		stopSpinner($('#spinner'));
		if(type == 'disambiguation'){
			$('.champion.error').html('<a href="' + article.url + '" target="_blank">ambiguous topic</a>');
		}
		else if(type == 'missingtitle'){
			$('.champion.error').html('no such topic');
		}
	}
	
	function challengerError(type, article){
		stopSpinner($('#spinner'));
		if(type == 'disambiguation'){
			$('.challenger.error').html('<a href="' + article.url + '" target="_blank">ambiguous topic</a>');
		}
		else if(type == 'missingtitle'){
			$('.challenger.error').html('no such topic');
		}
	}
	
	function lookupArticles(){
		if($('#spinner').html() != 'do it!')
			return;
		$('.error').html('');
		var champion = $('#champion').val();
		var challenger = $('#challenger').val();
			
		var box = $('#result-box');
		box.empty();
		startSpinner($('#spinner'));
			
		getArticle(champion, function(champion){
			getArticle(challenger, function(challenger){
				stopSpinner($('#spinner'));
				if(champion.wordcount > challenger.wordcount){
					displayWinner(champion, challenger);
				}
				else if(champion.wordcount < challenger.wordcount){
					displayWinner(challenger, champion);
				}
				else{
					alert('unbelievable: a tie.');
				}
			}, challengerError);
		}, championError);
			
		return false;
	}
	
	$(document).ready(function(){
		$('input').keydown(function(event){
			if(event.which == 13 || event.which == 25){
				lookupArticles();
			}
		});
		$('#spinner').click(lookupArticles);
	});
})(jQuery);