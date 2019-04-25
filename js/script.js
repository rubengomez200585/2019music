import air from "./AIRAliases.js";
/* Author: Eduardo Ludi */
//window.nativeWindow.stage.quality = 'BEST';
//window.nativeWindow.stage.displayState = runtime.flash.display.StageDisplayState.FULL_SCREEN_INTERACTIVE;
$(document).ready(function(){
	//console(window.nativeWindow.stage.quality);
	
	
	/* Global variables */
	//var separator = '/'; 
	//var base_path = '../../'; 
	var separator = air.File.separator;
	var base_path = air.File.applicationDirectory;//.nativePath;
		
	// var lyrics_dir = base_path + separator + 'Letra';
	// var music_dir = base_path + separator + 'Musica';
	var lyrics_dir = base_path.resolvePath('Letra');
	var music_dir = base_path.resolvePath('Musica');
	
	//alert(base_path.nativePath);
	//console(lyrics_dir.nativePath);
	//console(music_dir.nativePath);
	
	var selected_himn = '';
	var selected_number = 0;
	var selected_title = '';
	var selected_slides = 0;
	var selected_times = '';
	var selected_duration = 0;
	var music_mode = 'Letra';
	var music_modes = ['Letra','Instrumental','Cantado'];
	var modes = ['lyrics','instrumental','voices'];
	var mode_id = 0;
	var theme = 'all';
	var range = [0];
	var autoplay_timer;
	var single_play = true;
	var pause_after = 500;
	var can_play = false;
	var playing = false;
	var slide = 1;
	var force_jump = false;
	
	/* Screen Functions */
	
	function go_fullscreen() {
		window.nativeWindow.stage.displayState = runtime.flash.display.StageDisplayState.FULL_SCREEN_INTERACTIVE;
	}
	function is_fullscreen() {
		return window.nativeWindow.stage.displayState == runtime.flash.display.StageDisplayState.FULL_SCREEN_INTERACTIVE;
	}
	function go_normalscreen() {
		window.nativeWindow.stage.displayState = runtime.flash.display.StageDisplayState.NORMAL;
	}
	
	function toggle_fullscreen() {
		if (is_fullscreen()) {
			go_normalscreen();
		} else {
			go_fullscreen();
		}
	}
	
	window.nativeWindow.addEventListener(air.Event.ACTIVATE, function(event) { $('body').focus(); })
	
	// Paths
	function generatePaths(number,title) {
		selected_himn = generateSelectedHimn(number,title);
	}

	function generateSelectedHimn(number,title) {
		return (padValue(number,'0',3) + " - " + $.trim(replaceChars(title).replace(/_+/gm,' ').replace(/-+/gm,'').replace(/\s+/gm,' ')));//.replace(/\s+/gm,'%20');
	}
	
	function generateMusicPath() {
		var music_file = music_mode + separator + selected_himn + ".mp3";
		var music_file_path = music_dir.resolvePath(music_file);
		var music_file_url = 'file://' + osx_path_filter(music_file_path.nativePath);
		//console(music_file_url);
		return music_file_url;
	}
	function generateLyricsPath(number) {
		var lyrics_file = selected_himn + separator + padValue(number,'0',2) + ".jpg";
		var lyrics_file_path = lyrics_dir.resolvePath(lyrics_file);
		var lyrics_file_url = 'file://' + osx_path_filter(lyrics_file_path.nativePath);
		//console(lyrics_file_url);
		return lyrics_file_url;
	}
	
	function osx_path_filter(path) {
		var osx_path = '/HimnarioAdventista.app/Contents/Resources';
		if (path.match(osx_path)) {
			path = path.replace(osx_path, '');
		}
		return path;
	}
	
	/* This function will pad the left or right side of any variable passed in */
	function padValue(to_pad, padChar, finalLength) {
	  //check the length for escape clause
	  if(to_pad.toString().length >= finalLength) { return to_pad; }
	  return padValue(padChar + to_pad, padChar, finalLength);
	}
	
	/* Replace Chars */
	var sdiakA;
	var bdiakA;

	function initReplaceChars(){
		var sdiak = "áäàéëèíïìóöòúüùÁÄÀÉËÈÍÏÌÖÓÒÜÚÙñÑ !¡?¿'";
		var bdiak = "aaaeeeiiiooouuuAAAEEEIIIOOOUUUnN_----_";
		sdiakA = new Array();
		bdiakA = new Array();

		for (var i=0;i<sdiak.length;i++){
			if (sdiak.charAt(i) == "?") {
				sdiakA.push(new RegExp(/\?/g));
			} else {
				sdiakA.push(new RegExp(sdiak.charAt(i), "g"));
			}
		}
		for (i=0;i<sdiak.length;i++) {
			bdiakA.push(bdiak.charAt(i))
		}
	}

	initReplaceChars();


	function replaceChars(string) {
		for (var i=0; i < sdiakA.length; i++) {
			string = string.replace(sdiakA[i], bdiakA[i]);
		}
		return (string)
	}
	
	function hiliter(word, source) {
		var rgxp = new RegExp(word, 'ig');
		var mtch = source.match(rgxp)
		var repl = (mtch != null) ? ('<span class="highlight">' + mtch + '</span>') : word;
		return source.replace(rgxp, repl);
	}
	
	function blank(text) {
		return (text == undefined || text == '')
	}
	function not_blank(text) {
		return !blank(text);
	}
	
	function between(n,a,b){
		return (a<=n && b>=n);
	}
	
	function console(text) {
		air.trace(text);
	}
	
	function textMatch(searchTerm,sourceText,beginWithOnly) {
		beginWithOnly = typeof beginWithOnly !== 'undefined' ? beginWithOnly : false;
		var termNormalized	= (beginWithOnly ? "^" : "" ) + replaceChars($.trim(searchTerm));
		var textNormalized	= replaceChars($.trim(sourceText)).toLowerCase();
		var searchRegex			= new RegExp(termNormalized,"i");
		var regexMatch			= textNormalized.search(searchRegex);
		return (regexMatch >= 0);
	}
	
	function findByNumber(find_number) {
		$('#himns').find('.himn[data-number="'+find_number+'"]').each(function(){
			var himn   = $(this);
			var number = himn.data('number');
			var title  = himn.data('title');
			var slides = himn.data('slides');
			var times  = himn.data('times');
			if (find_number == number) {
				$('#title_tbx').val(title);
				$('#slides_hbx').val(slides);
				$('#times_hbx').val(times);
			}
		});
	}
	
	findByNumber(0); // preload
	
	var results = 0;
	function findByTitle(find_term) {
		results = 0;
		$('#himns').find('.himn').each(function(){
			var himn   = $(this);
			var title  = himn.data('title');
			var number = himn.data('number');
			var slides = himn.data('slides');
			var times  = himn.data('times');
			if (textMatch(find_term,title)) {
				if (range[0] == 0 || between(parseInt(number),range[0],range[1])) {
					results++;
					var item  = $('<li class="item"></li>');
					var input = $('<input type="radio" id="result_'+number+'" name="results" value="'+number+'" title="'+title+'"/>');
					var label = $('<label for="result_'+number+'"></label>');
					var addme = $('<a class="to_playlist" href="#"><span>(+)</span></a>');
					item.append(input);
					label.html(accent_folded_hilite(title,find_term))
					item.append(label);
					item.append(addme);
					item.data('number', number);
					item.data('title', title);
					item.data('slides', slides);
					item.data('times', times);
					$('#search_results ul').append(item);
					$('#search_results').tinyscrollbar_update(); 
				}
			}
		});
	}
	
	
	/* LAYOUT */
	function resize_layout() {
		var win_width = $(window).width();
		var win_height = $(window).height()-1;
		var $main = $('#main, #background');
		$main.css({
			'width': win_width, 
			'height': win_height
		});
	}
	
	resize_layout();
	
	$(window).resize(function(event){
		resize_layout();
	});
	
	/* Key Bindings */
	$('body').keyup(function(event){
		key = event.which;
		//console(key);
		switch(key) {	
		case 187: // +
			selected_to_playlist();
			break;
		case 107: // + numeric keyboard
			selected_to_playlist();
			break;
		case 13: // Enter
			single_play = true;
			do_play();
			break;
		case 8: // Backspace
			go_home();
			break;
		case 27: // Esc
			go_home();
			break;
		case 122: // F11
			toggle_fullscreen();
			break;
		case 37: // up
			if (playing) { force_jump = true; prev_lyrics(); }
			break;
		case 38: // left
			if (playing) { force_jump = true; prev_lyrics(); }
			break;
		case 39: // right
			if (playing) { force_jump = true; next_lyrics(); }
			break;
		case 40: // bottom
			if (playing) { force_jump = true; next_lyrics(); }
			break;
		case 32: // Spacebar
			if (playing) { playpause_audio(); }
			break;
		}
	});
	
	
	$('body').keydown(function(event){
		key = event.which;
		//console(key);
		switch(key) {
		case 27: // Esc
			event.preventDefault();
			break;
		}
	});
	
	$('body').click(function(event){
		if (active_help) {
			toggle_help(event);
		}
	});
	
	/* START ANIMATIONS */
	$('#main').hide().delay(500).show(0,function(){
		go_fullscreen();
		$('#title').hide().delay(1000).fadeIn('slow');
		$('#searchbox').hide().delay(1500).fadeIn('slow');
		$('#playlist').hide().delay(2000).fadeIn('slow');
	});
	
	// App Buttons
	$('#app_buttons .button').live('click', function(event){
		event.preventDefault();
	});
	
	// close
	$('#app_buttons .button.close').live('click', function(event){
		var close_dialog = $('<div></div>');
		close_dialog.html( $('#close_app p').html() );
		close_dialog.dialog({
			title: $('#close_app h3').html(),
			resizable: false,
			modal: true,
			buttons: {
				'Si, salir': function() {
					$( this ).dialog( "close" );
					air.NativeApplication.nativeApplication.exit();
				},
				No: function() {
					//console($( this ).css('z-index'));
					$( this ).dialog( "close" );
				}
			}
		});
	});
	
	// help
	var active_help = false;
	$('.help_mode').hide();
	$('#app_buttons .button.help').live('click', function(event){
		toggle_help(event);
	});
	
	function toggle_help(event) {
		event.stopPropagation();
		if (active_help) {
			$('.help_mode').hide('fast');
			$('#background').animate({opacity: 1.0});
			active_help = false;
		} else {
			var to_hide = $('.help_mode');
			if ($('#add_to_playlist:visible').size() == 0) {
				to_hide = to_hide.not('.add_to_playlist');
			}
			to_hide.show('fast');
			$('#background').animate({opacity: 0.7});
			$('#logos').animate({opacity: 0.5});
			active_help = true;
		}
	}
	
	// info
	$('#app_buttons .button.info').live('click', function(event){
		var close_dialog = $('<div id="info_credits"></div>');
		close_dialog.html( $('#credits').html() );
		close_dialog.dialog({
			title: $('#info_app h3').html(),
			resizable: true,
			modal: true,
			width: 600,
			height: 400
		});
	});
	
	// fullscreen
	$('#app_buttons .button.fullscreen').live('click', function(event){
		//console(is_fullscreen());
		toggle_fullscreen();
	});
	
	// SearchBox
	
	$('#number_tbx').keyup(function(event){
		var number = Math.abs(parseInt($(this).val()));
		
		if (!isNaN(number)) {
			if (number < 1)   { number = 1; }
			if (number > 614) { number = 614 }
		} else {
			number = null;
		} 
		$('#number_tbx').val(number);
		
		if (number >= 1 && number <= 614) {
			findByNumber(number);
			enable_play();
			enable_add_to_playlist();
		} else {
			$('#title_tbx').val('');
			disable_play();
		 	disable_add_to_playlist();
		}
		
		toogle_clear_find();
	});
	
	function key_is_number(event) {
		return ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105));
	}
	
	function key_is_other_symbol(event) {
		var symbols = [106, 187, 189, 191];
		var is_symbol = false;
		for(i=0;i<symbols.length;i++) {
			is_symbol = (event.which == symbols[i]);
			if (is_symbol) { return true; }
		}
		return is_symbol;
	}
	
	function key_is_control(event) {
		return (event.which > 8 && event.which < 46);
	}
	
	$('#title_tbx').keydown(function(event) {
		if ( key_is_number(event) || key_is_other_symbol(event) ) {
			event.preventDefault();
		}
	});
	
	$('#title_tbx').keyup(function(event) {
		if ($(this).attr('disabled') != 'disabled') {
			
			nkic = !key_is_control(event);
			if (nkic) {
				disable_play();
				disable_add_to_playlist();
			}
			hide_menus();
			var term = $(this).val();
		
			if (event.which == 40) {
				first_result = $('#search_results').find('input')[0];
				$(first_result).attr('checked','checked').focus();
			} else if (nkic) {
				$('#search_results li').hide('fast').remove();

				toogle_clear_find();
				
				if (term.length >= 3) {
					findByTitle(term);
					if (results == 0) {
						$('#search_results').fadeOut('fast');
					} else {
						$('#search_results').fadeIn('fast');
					}
				} else {
					$('#search_results').fadeOut('fast');
				}
			}	
		}
	});
	
	$('#number_tbx,#title_tbx').mouseup(function(event){
		$(this).select();
		$('#search_results').fadeOut('fast');
	});
	
	function toogle_clear_find() {
		term = $('#title_tbx').val();
		
		if (term.length >= 1) {
			$('.clear_find').fadeIn('fast');
		} else {
			$('.clear_find').fadeOut('fast');
		}
	}
	
	function clear_find() {
		$('#number_tbx').val('');
		$('#title_tbx').val('');
		$('#slides_hbx').val('');
		$('#times_hbx').val('');
		toogle_clear_find();
	}
	
	$('.clear_find').hide();
	
	$('.clear_find').click(function(event){
		clear_find();
		hide_search_results();
		disable_add_to_playlist();
	});
	
	disable_play();
	
	function enable_play() {
		can_play = true;
		$('#play').removeClass('disabled');
	}
	function disable_play() {
		can_play = false;
		$('#play').addClass('disabled');
	}
	
	$('#play').live('click enter', function(event) {
		if (!$(this).hasClass('disabled')) {
			single_play = true;
			do_play();
		}
	});
	
	$('#search_results').tinyscrollbar();
	
	$('#search_results input').live('focus change keydown',function() {
		var item 				= $(this).closest('li');
		selected_number = item.data('number');
		selected_title  = item.data('title');
		selected_slides = item.data('slides');
		selected_times  = item.data('times');
		$('#search_results li').removeClass('selected');
		item.addClass('selected');
		$('#number_tbx').val(selected_number);
		$('#title_tbx').val(selected_title);
		$('#slides_hbx').val(selected_slides);
		$('#times_hbx').val(selected_times);
		enable_play();
		enable_add_to_playlist();
	});
	
	$('#search_results input').live('keydown',function(event) {
		//console.log(event.which);
		var key = event.which;
		if (key == 40 || key == 39) {
			//console.log('down');
		} else if (key == 38 || key == 37) {
			//console.log('up');
		}
	});
	
	$('#search_results li').live('click',function(event) {
		$(this).find('input').focus();
	});
	
	
	$('#search_results li').live({
		mouseenter: function(event) {
			addme = $(this).find('.to_playlist');
			addme.fadeIn('fast');
		},
		mouseleave: function(event) {
			addme = $(this).find('.to_playlist');
			addme.fadeOut('slow');
		}
	})
	
	$('#search_results li .to_playlist').live('click',function(event) {
		event.stopPropagation();
		item = $(this).closest('li');
		results_to_playlist(item);
	});
	
	$('#search_results .close').hide();
	$('#search_results .scrollbar').fadeTo(0,0.2);
	
	$('#search_results').live({
		mouseenter: function(event) {
			close = $(this).find('.close');
			close.fadeIn('slow');
			scroll = $(this).find('.scrollbar');
			scroll.fadeTo('fast',0.8);
		},
		mouseleave: function(event) {
			close = $(this).find('.close');
			close.fadeOut('fast');
			scroll = $(this).find('.scrollbar');
			scroll.fadeTo('slow',0.2);
		}
	})
	
	$('#search_results .close').click(function(event){
		event.stopPropagation();
		event.preventDefault();
		$(this).fadeOut('fast', function(){
			hide_search_results();
		});
	});
	
	function hide_menus() {
		$('.menu').hide('fade','fast');
	}
	function hide_search_results() {
		$('#search_results').hide('fade','fast');
	}
	
	$('body').click(function(event){
		hide_menus();
	});
	
	$('.button_menu').click(function(event){
		event.preventDefault();
		event.stopPropagation();
		hide_search_results();
		$(this).next('.menu').toggle('fade','fast');
	});
	
	$('.menu li').click(function(event){
		event.stopPropagation();
		var item = $(this);
		var id   = item.attr('id');
		var menu = item.closest('.menu');
		var wrap = item.closest('.menu_wrapper');
		
		menu.find('li').removeClass('selected');
		item.addClass('selected');
		wrap.find('.button_menu').attr('class','button_menu '+id);
		menu.toggle();
		
		switch(menu.attr('id')) { 
		case 'mode_menu':
			switch(item.attr('id').replace(/mode_/,'')) {
			case 'lyrics':	
				mode_id = 0;
				music_mode = 'Letra';
				break;
			case 'instrumental':
				mode_id = 1;
				music_mode = 'Instrumental';
				break;
			case 'voices':	
				mode_id = 2;
				music_mode = 'Cantado';
				break;
			}
			//console.log('mode: ' + music_mode);
			break;
		case 'theme_menu': 
			clear_find(); // remove all text form fields
			theme = item.attr('id').replace(/theme_/,'');
			range = item.data('range').split('-').map( function(x) { return parseInt(x) } );
			$('#search_results li').hide('fast').remove();
			findByTitle($('#title_tbx').val());
			if (results > 0) {
				$('#search_results').fadeIn('fast');
			} else {
				$('#search_results').fadeOut('fast');
			}	
			$('#search_results').tinyscrollbar_update();
			break; 
		}
	});
	
	/* PLAYLIST */
	function toggle_playlist() {
		playlist = $('#playlist');
		playlist_outer = playlist.find('> .outer');
		playlist_items_size = playlist.find('.inner .item').size();
		logos = $('#logos');
		buttons = $('#playlist').find('#play_list, #shuffle_list, #clear_list,#save_list');
		switch(playlist_items_size) {
		case  1:
			playlist.animate({'height': 190});
			playlist_outer.animate({'height': 180});
			playlist.find('.inner .item').first().addClass('current');
			logos.animate({'bottom':200});
			buttons.fadeIn('fast');
			break;
		case 0:
			playlist.animate({'height': 25});
			playlist_outer.animate({'height': 25});
			logos.animate({'bottom':30});
			buttons.fadeOut('fast');
			break;
		}
	}
	function add_to_playlist() {
		if (not_blank(sel_number) && not_blank(sel_title)) {
			item = $('<div class="item"><a href="#" class="remove">&nbsp;</a></div>');
			mode = $('<span class="mode"></span>')
			number = $('<strong class="number"></strong>');
			title = $('<em class="title"></em>'); 
			playme = $('<div class="playme"></div>');
			item.data('number',sel_number);
			item.data('title',sel_title);
			item.data('slides',sel_slides);
			item.data('times',sel_times);
			item.data('mode',mode_id);
			item.append(playme);
			item.append(mode.addClass(modes[mode_id]));
			item.append(number.html(sel_number));
			item.append(title.html(sel_title));
			item.appendTo('#playlist .inner').show('highlight',{color:'#52331C'},'slow');
			toggle_move_list_buttons();
			toggle_playlist();
		}
	}
	
	function selected_to_playlist() {
		sel_number	= $('#number_tbx').val();
		sel_title	= $('#title_tbx').val();
		sel_slides	= $('#slides_hbx').val();
		sel_times	= $('#times_hbx').val();
		
		add_to_playlist();
		
		$('#number_tbx').select();
	}
	
	function results_to_playlist(item) {
		sel_number	= $(item).data('number');
		sel_title	= $(item).data('title');
		sel_slides	= $(item).data('slides');
		sel_times	= $(item).data('times');
		add_to_playlist();
	}
	
	disable_add_to_playlist();
	
	function enable_add_to_playlist() {
		$('#mode_and_play').animate({'width': 179, 'right': -12}, 'fast');
		var button = $('#add_to_playlist');
		var help = $('.help_mode.add_to_playlist');
		if (button.css('display') == 'none') {
			button.show('slide','fast');
			if (active_help) { help.show('slide','fast'); }
		}
	}
	
	function disable_add_to_playlist() {
		$('#mode_and_play').animate({'width': 121, 'right': 46}, 'fast');
		var button = $('#add_to_playlist');
		var help = $('.help_mode.add_to_playlist');
		if (button.css('display') == 'block') {
			$('#add_to_playlist').hide('slide','fast');
			help.hide('slide','fast');
		}
	}
	
	$('#add_to_playlist').click(function(event) {
		selected_to_playlist();
	});
	
	$('a').live('click', function(event){
		event.preventDefault();
		event.stopPropagation();
	});
	
	var dragging = false;
	$('#playlist').disableSelection();
	$('#playlist .inner').sortable( { 
		placeholder: 'placeholder', 
		forcePlaceholderSize: false, 
		axis: 'x', 
		container: 'parent',
		start: function(event, ui) {
			dragging = true;
		},
		stop: function(event, ui) {
			dragging = false;
		}
	});
	
	$('#playlist .item').live( {
		click: function(event) { 
			if (!dragging) {
				$('#playlist').find('.item.current').removeClass('current');
				item = $(this);
				item.addClass('current');
				current = item;
				single_play = false;
				do_play();
			}
		},
		mouseenter: function(event) {
			if (!dragging) {
				item = $(this);
				item.find('.playme').stop().fadeIn('fast');
				is_hover = true;
				setTimeout(function(){
					if (is_hover) { item.find('.remove').fadeIn('fast');	}
				},100);
				item.addClass('hover',300);
			}
		},
		mouseleave: function(event) {
			if (!dragging) {
				item = $(this);
				item.find('.playme').fadeOut('fast');
				item.find('.remove').fadeOut('fast');
				item.removeClass('hover',300);
				is_hover = false;
			}
		}
	});
	
	$('#playlist .item .remove').live('click', function(event) {
		event.stopPropagation();
		var item = $(this).closest('.item');
		item.hide('fast',function(){
			item.remove();
			toggle_move_list_buttons();
			toggle_playlist();
		});
	});
	
	var moving_list = false; 
	var playlist_inner_div = $('#playlist .inner');
	var playlist_item_width = (144+10);
	var how_much_move = playlist_item_width*2; // (width(+margin+border) + margin-left) * how_many_items
	
	function move_playlist(elem,direction) {
		event.preventDefault();
		if (!$(elem).hasClass('disabled')) {
			if (!moving_list) {
				left = parseInt(playlist_inner_div.css('left'));
				moving_list = true;
				left = (direction == 'left') ? (left + how_much_move) : (left - how_much_move);
				$('#playlist .inner').animate({'left': left}, 'fast', function(){
					moving_list = false;
					toggle_move_list_buttons();
				});
			}
		}
	}
	
	var list_left_button = $('#playlist .move_button.left');
	var list_right_button = $('#playlist .move_button.right');
	
	list_left_button.addClass('disabled');
	list_right_button.addClass('disabled');
	
	function toggle_move_list_buttons() {
		var left = parseInt(playlist_inner_div.css('left'));
		var items_count = $('#playlist .inner .item').size();
		var playlist_width = parseInt($('#playlist').width());
		var playlist_inner_width = (playlist_item_width * items_count);
		
		if (playlist_inner_width < playlist_width ) {
			left = 25;
			playlist_inner_div.css('left', left);
			list_left_button.addClass('disabled');
		}
		
		if (left >= 25) {
			list_left_button.addClass('disabled');
		} else if (left < 0) {	
			list_left_button.removeClass('disabled');
		}
		if ((left < 0) && ((Math.abs(left)+playlist_width) > playlist_inner_width)) {
			list_right_button.addClass('disabled');
		} else if ( (playlist_inner_width) > playlist_width) {
			list_right_button.removeClass('disabled');
		}
	}
	
	$('#playlist .move_button.left').live('click', function(event) {
		move_playlist(this,'left');
	});
	$('#playlist .move_button.right').live('click', function(event) {
		move_playlist(this,'right');
	});
	
	
	var tooltip;
	$('#playlist .actions .button span').hide();
	$('#playlist .actions .button').live({
		mouseenter: function(event) {
			tooltip = $(this).find('span');
			tooltip.fadeIn('fast');
		},
		mouseleave: function(event) {
			tooltip = $(this).find('span');
			tooltip.fadeOut('slow');
		}
	})
	
	
	$('#playlist').find('#play_list, #shuffle_list, #clear_list, #save_list').hide();
	
	var saveDir = air.File.documentsDirectory.resolvePath('lista.hapl');
	var openDir = air.File.documentsDirectory;
	
	 var playlistFilter = new air.FileFilter("Lista de Himnos", "*.hapl");
	
	$('#playlist #save_list').click(function(event){ 
		if (!list_empty()) {
			saveDir.browseForSave("Guardar lista...");
			saveDir.addEventListener(air.Event.SELECT, saveFile);
		}
	});
	
	function saveFile(event) {
		var list = [];
		var file = event.target;
		$('#playlist .item').each(function() {
			list.push($(this).data('number') + '|'+ $(this).data('mode'));
		});
		var data = JSON.stringify(list);
		var stream = new air.FileStream();
		stream.open(file, air.FileMode.WRITE);
		stream.writeUTFBytes(data);
		stream.close();
		return true;
	}
	
	$('#playlist #open_list').click(function(event){
		clear_list( function() {
			openDir.browseForOpen("Abrir lista...", [playlistFilter]);
			openDir.addEventListener(air.Event.SELECT, openFile);
		});
	});
	
	function openFile(event) {
		var file = new air.FileStream();
		file.open(event.target, air.FileMode.READ);
		var list = file.readUTFBytes(file.bytesAvailable) + '';
		list = list.slice(1,-1).replace(/"/ig,'').split(',');
		var list_size = list.length;
		for(i=0;i<list_size;i++) {
			item = list[i].split('|');
			var h = $('#himns').find('.himn[data-number="'+item[0]+'"]');
			sel_number = h.data('number');
			sel_title = h.data('title');
			sel_slides = h.data('slides');
			sel_times = h.data('times');
			mode_id = item[1];
			add_to_playlist();
		}
		return true;
	}
	
	function list_size() {
		return $('#playlist .item').size()
	}
	
	function list_empty() {
		return (list_size() == 0);
	}
	
	function clear_list(callback) {
		if (!list_empty()) {
			var clear_dialog = $('<div></div>');
			clear_dialog.append($('#clearlist_dialog p').html());
			clear_dialog.dialog({
				title: $('#clearlist_dialog .title').html(),
				resizable: false,
				modal: true,
				buttons: {
					'Si, limpiar lista': function() {
						var items = playlist.find('.item');
						items.hide('fast');
						setTimeout(function() { 
							items.remove();
							toggle_playlist();
						}, 300);
						$( this ).dialog( "close" );
						callback();
					},
					No: function() {
						$( this ).dialog( "close" );
					}
				}
			});
		} else {
			callback();
		}
	}
	
	$('#playlist #shuffle_list, #playlist #clear_list')
	$('#playlist #clear_list').click(function(event){ 
		clear_list(function(){ return false; });
	});	
	
	function shuffle_list() {
		var parent = $('#playlist .inner');
		var divs = parent.children();
		while (divs.length) {
			parent.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
		}
	}
	
	$('#playlist #shuffle_list').click(function(event){
		var shuffle_dialog = $('<div></div>');
		shuffle_dialog.append($('#shufflelist_dialog p').html());
		shuffle_dialog.dialog({
			title: $('#shufflelist_dialog .title').html(),
			resizable: false,
			modal: true,
			buttons: {
				'Si, mezclar lista': function() {
					shuffle_list()
					$( this ).dialog( "close" );
				},
				No: function() {
					$( this ).dialog( "close" );
				}
			}
		});
	});
	
	$('#playlist #play_list').click(function(event){ 
		current = playlist.find('.current');
		single_play = false;
		can_play = true;
		do_play();
	});
	
	/* PLAY STAGE */
	
	$('#playing,#pause').hide();
	
	var playlist = $('#playlist .inner');
	var player, channel;
	var current, prev, next;
	var next_exists = false;
	var prev_exists = false;
	var loader_context = new air.SoundLoaderContext(10000, false);
	
	var playtime = 0;
	
	function find_current_and_nears() {
		if (!list_empty()) {
			current = playlist.find('.current');
			if (current.size()>0) {
				prev = current.prev('.item');
				next = current.next('.item');
				prev_exists = (prev.size() == 1);
				next_exists = (next.size() == 1);
			} else {
				current = playlist.find('.item:first-child').addClass('current');
				find_current_and_nears();
			}
		}
	}
	
	function toggle_controls() {
		find_current_and_nears();
		if (prev_exists || slide > 1) { 
			$('#playing .controls .prev').show();
		} else {
			$('#playing .controls .prev').hide();
		}
		if (next_exists || slide < selected_slides ) {
			$('#playing .controls .next').show();
		} else {
			$('#playing .controls .next').hide();
		}
	}
	
	function play_next() {
		find_current_and_nears();
		//console(next_exists);
		if (next_exists) {
			current.removeClass('current');
			next.addClass('current');
			find_current_and_nears();
			clear_to_play();
			playing = false;
			do_play();
		} else {
			go_home();
		}
	}
	
	function play_prev() {
		find_current_and_nears();
		//console(prev_exists);
		if (prev_exists) {
			current.removeClass('current');
			prev.addClass('current');
			find_current_and_nears();
			playing = false;
			clear_to_play();
			do_play(true);
		}
	}
	
	function do_play(){
		var reverse = arguments[0];
		var snum,stit,ssli,slim;
		//console(single_play);
		
		if (single_play) {
			snum = $('#number_tbx').val();
			stit = $('#title_tbx').val();
			ssli = $('#slides_hbx').val();
			stim = $('#times_hbx').val(); 
		} else {
			snum = current.data('number');
			stit = current.data('title');
			ssli = current.data('slides');
			stim = current.data('times');
			mode_id	   = current.data('mode');
			music_mode = music_modes[mode_id];
		}
		
		selected_number = parseInt(snum);
		selected_title 	= stit;
		selected_slides = parseInt(ssli);
		selected_times 	= stim.split(',').map( function(x) { return parseInt(x) } );
		slide = ( reverse ? selected_slides : 1 );
		
		if (!playing && not_blank(selected_number) && not_blank(selected_title) ) {
		
			generatePaths(selected_number,selected_title);
			playing = true;
			paused = false;
			
			$('#lyrics').data('slides', selected_slides);
			$('#lyrics').attr('src', generateLyricsPath(slide));
			
			toggle_controls();
			
			$('#playing').fadeIn('fast', function(){
				$('#main input').attr('disabled','disabled');
				play_selected(reverse);
			});
		}
	}
	
	function play_selected(reverse) {
		if (music_mode != 'Letra') {
			player = new air.Sound();
			player.addEventListener(air.Event.COMPLETE, audio_ready);
			channel = new air.SoundChannel();
			var mp3_req = new air.URLRequest(generateMusicPath());
			can_play = false; // when song is loaded will be set to true
			player.load(mp3_req,loader_context);
			var refresh = 100;
			clear_to_play();
			locked_controls = false;
			
			autoplay_timer = setInterval(function(){
				if (!paused && can_play && selected_duration > 0) {
					playtime = parseInt(channel.position);
					if (playtime == selected_duration) {
						//console('should end');
						audio_ended();
					} else if (reverse) {
						//console('should reverse');
						force_jump = true;
						seek_audio(selected_slides-1);
						reverse = false;
					} else if (selected_times[slide-1] < playtime) {
						//console('should next lyrics');
						next_lyrics();
					}
				}
			}, refresh);
		}
	}
	
	function audio_ready() {
		//console('Audio ready!');
		can_play = true;
		selected_duration = parseInt(player.length);
		channel = player.play();
		channel.soundTransform.volume = 1;
		channel.addEventListener(air.Event.SOUND_COMPLETE, audio_ended);
	}
	
	function audio_ended() {
		console('Audio ended!');
		//playing = false;
		clear_to_play();
		setTimeout(function() {
			if (single_play) {
				go_home();
			} else {
				play_next();
				//next_after_pause = true;
				//playpause_audio();
			}
		}, pause_after);
	}
	
	function clear_to_play() {
		can_play = true;
		slide = 1;
		playtime = 0;
		clearInterval(autoplay_timer);
	}
	
	var pause_seek = 0;
	var paused = false;
	var locked_controls = false;
	var next_after_pause = false;
	
	function playpause_audio(){
		if (paused) {
			if (channel) { channel = player.play(pause_seek); }
			paused = false;
			locked_controls = false;
			$('#pause').fadeOut('fast');
			if (next_after_pause) {
				play_next();
				next_after_pause = false;
			}
		} else {
			$('#pause').fadeTo('fast',0.95);
			if (channel) { 
				pause_seek = channel.position; 
				channel.stop();
			}
			paused = true;
			locked_controls = true;
		}
	}
	
	function seek_audio(sl) { // sl = slide
		if (force_jump) {
			var instant = 0;
			if (sl > 0) { 
				instant = selected_times[sl-1];
				slide = sl;
			};
			channel.stop();
			channel = player.play(instant);
			
			playtime = instant;
			force_jump = false;
		}
	}
	
	var playing_controls = $('#playing .controls');
	
	function hideControls() {
		playing_controls.fadeOut('fast');
	}

	function showControls() {
		playing_controls.fadeIn('fast');
	}
	
	$('body')[0].onmousemove = (function() {
		var onmousestop = function() {
			air.Mouse.hide();
		}, thread;

		return function() {
			air.Mouse.show();
			clearTimeout(thread);
			thread = setTimeout(onmousestop, 1500);
		};
	})();

	
	function go_home() {
		selected_slides = 0;
		clear_to_play();
		playing = false;
		$('#main input').removeAttr('disabled');
		$('#main').show('fast', function(){
			$('#playing').fadeOut('fast');
			if (music_mode != 'Letra') {
				audio_fade_out(function(){ return true; });
			}
		});
	}
	
	function audio_fade_out(callback) {
		if (channel != undefined) {
			var vol = 0.99;
			t = setInterval(function(){
				vol = vol - 0.03;
				if (vol > 0) { 
					var trans = new air.SoundTransform(vol, 0);
					channel.soundTransform = trans;
				} else {	
					channel.stop();
					clearInterval(t);
					callback();
				}
			},50);
		}
	}
	
	function next_lyrics() {
		if (!locked_controls) {
			if (slide < selected_slides) {
				if (mode_id != 0) {
					seek_audio(slide);
				}
				slide++;
				$('#lyrics').attr('src',generateLyricsPath(slide));
				if (slide == 2) {
					$('#playing .controls .prev').show('fade','slow');
				}
				if (slide == selected_slides && !next_exists) {
					$('#playing .controls .next').hide('fade','fast');
				}
			} else {
				if (!list_empty()) {
					find_current_and_nears();
					//console("Next?"+next_exists+" Slide="+slide+" Slides="+selected_slides)
					if (next_exists && slide == selected_slides) {
						locked_controls = true; // looks controls until true
						audio_fade_out(function() { play_next() });
					}
				}
			}
		}
	}

	function prev_lyrics() {
		if (!locked_controls) {
			if (slide > 1) {
				slide--;
				$('#lyrics').attr('src',generateLyricsPath(slide));
				if (slide == (selected_slides-1)) {
					$('#playing .controls .next').show('fade','slow');
				}
				if (slide == 1 && !prev_exists) {
					$('#playing .controls .prev').hide('fade','fast');
				}
				if (slide > 0 && mode_id != 0) {
					seek_audio(slide-1);
				}
			} else {
				if (!list_empty()) { 
					find_current_and_nears(); 
					console("Prev?="+prev_exists+" Slide="+slide);
					if (prev_exists) {
						locked_controls = true; // looks controls until true
						audio_fade_out(function() { play_prev(); });
					}
				}
			}
		}
	}
	
	$('.credits_inner a').live('click', function(event) {
		var container = $(this).closest('#info_credits');
		var scrollTo 	= container.find($(this).attr('href'));
		var scrollTop = (container.scrollTop() + scrollTo.offset().top - container.offset().top);
		container.animate({ scrollTop: scrollTop },'slow');
	});
	
	
	$('#pause').live('click', function(event) {
		playpause_audio();
	});
	
	$('#playing .controls .next').click(function(event){
		force_jump = true;
		next_lyrics();
	});
	
	$('#playing .controls .prev').click(function(event){
		force_jump = true;
		prev_lyrics();
	});
	
	$('#playing .controls .home').click(function(event){
		go_home();
	});
	
});
