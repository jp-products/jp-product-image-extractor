$.fn.isVisible = function () {
    // Current distance from the top of the page
    var windowScrollTopView = $(window).scrollTop();

    // Current distance from the top of the page, plus the height of the window
    var windowBottomView = windowScrollTopView + $(window).height();

    // Element distance from top
    var elemTop = $(this).offset().top;

    // Element distance from top, plus the height of the element
    var elemBottom = elemTop + $(this).height();

    return ((elemBottom <= windowBottomView) && (elemTop >= windowScrollTopView));
}

var loadStatus = true;
var final = false;

$(document).ready(function () {
/*
	$('label').click(function() {
		if ( $(this).prev().hasClass('checkboxs') ) {
			$(this).prev().trigger('click');
		}
	});*/

    $("body").on("click",".whishlist--add",function(e){
        var wish_add=$(this);
        var wish_remove=$(this).parent().find(".whishlist--remove");

        var sku=$(this).data("sku");
        let urlWishList = window.location.pathname;

        $.getJSON(siteUrl + 'ajax.php?action=addWishlist&sku=' + sku + '&url=' + urlWishList, {}, function (data) {
            if(data.success){
                wish_add.hide();
                wish_remove.show();
            }
        });
        e.preventDefault();
    });

    $("body").on("click",".whishlist--remove",function(e){
        var wish_remove=$(this);
        var wish_add=$(this).parent().find(".whishlist--add");


        var sku=$(this).data("sku");

        $.getJSON(siteUrl + 'ajax.php?action=removeWishlist&sku=' + sku, {}, function (data) {
            if(data.success){
                wish_remove.hide();
                wish_add.show();
            }
        });
        e.preventDefault();
    });


    $("#formCand").submit(function(){
        sendCandidatura();
        return false;
    });
    $("#formRegisto").submit(function(){
        formRegisto();
        return false;
    });
    $("#formLogin").submit(function(){
        formLogin();
        return false;
    });
    $("#prodForm,#contactForm").submit(function(){
        sendForm();
        return false;
    });
    $("#passwordLogin").submit(function(){
        passwordLogin();
        return false;
    });
    $("#alterarPassword").submit(function(){
        alterarPassword();
        return false;
    });
    /*$("#formNewsletter").submit(function(){
        sendNewsletter();
        return false;
    });*/


    if ($(window).width() > 768) {
        $('.bottombar .bottombar__menu_top .logo-link img').attr('src',siteUrl+'assets/img/logo.png')
    } else {
        $('.bottombar .bottombar__menu_top .logo-link img').attr('src',siteUrl+'assets/img/logo_blk.png')
    }

    carrousel();

    onload();

    loadProdutcts();

    loadByScroll();

    ordenacao();

    verTodasCores();

    verRelacionadas();

    selectItemContact();

    sendNewsletter();

    clearFilters();

    hashTag();

    // Forms validation
    initValidation();
    // on website initilization
    onInitialize();

    imageheight_product();

    setHeight(".banner--large");
    setHeight(".banner--fixed");

    /* Sharing */
    // $(".tw-share").sharing("twitter");
    // $(".fb-share").sharing("facebook");
    // $(".pt-share").sharing("pinterest");
    // $(".ln-share").sharing("linkedin");
    // $(".gp-share").sharing("googleplus");



    //Cookies

    $("#removecookie").on("click", function () {
        createCookie('eucookie', 'eucookie', 365 * 10);
        $(".cookies-bar").slideUp("slow", function () {
            $(".cookies-bar").remove();
        });
    });

    if ($(".contact-list").length > 0) {
        // new SimpleBar($('.contact-list__menu')[0]);
    }

    var getArticleID = $("#article-content").attr("data-id");

    // $(".article-id-"+getArticleID).addClass("selected").click();


    $("main .institutional-template").css({
        "margin-top": $("header .topbar").outerHeight() + "px"
    });

    // on mobile some actions
    if ($(window).width() < 768) {
        var html = $(".first-column .bottombar__menu_middle-content:nth-child(2)");
        $(".third-column .bottombar__menu_middle-content").after(html);


    } else {

        var html = $(".third-column .bottombar__menu_middle-content:nth-child(2)");
        $(".first-column .bottombar__menu_middle-content").after(html);

    }

    // show menu
    $(".topbar__items-link--menu").click(function (e) {
        $(".bottombar").addClass("active");
        return false;
    });

    $(".bottombar-before").click(function () {
        $(".bottombar").removeClass("active");
    });

    // hide menu
    $(".bottombar__close").click(function () {
        $(".bottombar").removeClass("active");

        if ($(".bottombar__menu_middle-content__item").hasClass("active")) {
            $(".bottombar__menu_middle-content__item").removeClass("active")
        }
        return false;
    });

    smoothScroll("section .go", 0);

    //
    // Google Invisible Recaptcha
    //

    /*if (typeof sitekey !== 'undefined') {

        var recaptcha_ids = [];
        var contador = 0;
        var onloadCallback = function () {
            $('.invisible-recaptcha').each(function () {
                var $key = $(this).data('sitekey');
                var $form = $(this).closest('form').attr('id');

                temp_cena = grecaptcha.render($(this).attr('id'), {
                    'sitekey': sitekey,
                    'callback': function (token) {
                        if (!$('#' + $form)[0].checkValidity()) {
                            $('#' + $form + ' :input:visible[required="required"]').each(function () {
                                if (!this.validity.valid) {
                                    $(this).parent().addClass('error');
                                    // break
                                    // return false;
                                } else {
                                    $(this).parent().removeClass('error');
                                }
                            });

                            // reset recaptchas
                            var contador2 = 0;
                            $('.g-recaptcha').each(function () {
                                grecaptcha.reset(recaptcha_ids[contador2]);
                                contador2++;
                            });
                            // reset recaptchas END
                        } else {
                            $('#' + $form).submit();
                        }

                    }
                });

                recaptcha_ids.push(temp_cena);
                contador++;
            });

        }; // end callback

    }*/

    // toggle CheckBoxes
    $(".filter .checkboxs_check").click(function () {
        $(this).parent().parent().toggleClass('checked');
        $(this).parent().children("input[type='checkbox']").toggleClass('checked');

        if ($(this).parent().children("input[type='checkbox']").hasClass('checked')) {
            // toggle status of input checkbox
            $(this).parent().children("input[type='checkbox']").attr("checked", true);
            // toggle class on icon
            $(this).parent().children(".checkboxs_check:first-child").removeClass("active");
            $(this).parent().children(".icon-checked.checkboxs_check").addClass("active");
        } else {
            $(this).parent().children("input[type='checkbox']").attr("checked", false);
            // toggle status of input checkbox
            $(this).parent().children(".icon-checked.checkboxs_check").removeClass("active");
            // toggle class on icon
            $(this).parent().children(".checkboxs_check:first-child").addClass("active");
        }
        var clicked = $(this).closest('ul').attr('id');
        $('.loader').show();
        setTimeout(function () {
            $('#product-list .product-itens').html("");
            filtros(clicked);
        }, 400);
    });


    $(".filter .filters__field-bottom label").on('click', function () {
       $(this).parent().parent().toggleClass('checked');
        $(this).parent().children("input[type='checkbox']").toggleClass('checked');

        if ($(this).parent().children("input[type='checkbox']").hasClass('checked')) {
            // toggle status of input checkbox
            $(this).parent().children("input[type='checkbox']").attr("checked", true);
            // toggle class on icon
            $(this).parent().children(".checkboxs_check:first-child").removeClass("active");
            $(this).parent().children(".icon-checked.checkboxs_check").addClass("active");
        } else {
            $(this).parent().children("input[type='checkbox']").attr("checked", false);
            // toggle status of input checkbox
            $(this).parent().children(".icon-checked.checkboxs_check").removeClass("active");
            // toggle class on icon
            $(this).parent().children(".checkboxs_check:first-child").addClass("active");
        }

        var clicked = $(this).closest('ul').attr('id');
        $('.loader').show();
        setTimeout(function () {
            $('#product-list .product-itens').html("");
            filtros(clicked);
        }, 500);
    });



    //Newsletter

    // toggle CheckBoxes
    $(".newsletter__interest-area__list .checkboxs_check").click(function () {
        $(this).parent().parent().toggleClass('checked');
        $(this).parent().children("input[type='checkbox']").toggleClass('checked');

        if ($(this).parent().children("input[type='checkbox']").hasClass('checked')) {
            // toggle status of input checkbox
            $(this).parent().children("input[type='checkbox']").attr("checked", true);
            // toggle class on icon
            $(this).parent().children(".checkboxs_check:first-child").removeClass("active");
            $(this).parent().children(".icon-checked.checkboxs_check").addClass("active");
        } else {
            $(this).parent().children("input[type='checkbox']").attr("checked", false);
            // toggle status of input checkbox
            $(this).parent().children(".icon-checked.checkboxs_check").removeClass("active");
            // toggle class on icon
            $(this).parent().children(".checkboxs_check:first-child").addClass("active");
        }

    });

    $(".newsletter-termos .checkboxs_check").click(function () {
        $(this).parent().parent().toggleClass('checked');
        $(this).parent().children("input[type='checkbox']").toggleClass('checked');

        if ($(this).parent().children("input[type='checkbox']").hasClass('checked')) {
            // toggle status of input checkbox
            $(this).parent().children("input[type='checkbox']").attr("checked", true);
            // toggle class on icon
            $(this).parent().children(".checkboxs_check:first-child").removeClass("active");
            $(this).parent().children(".icon-checked.checkboxs_check").addClass("active");
        } else {
            $(this).parent().children("input[type='checkbox']").attr("checked", false);
            // toggle status of input checkbox
            $(this).parent().children(".icon-checked.checkboxs_check").removeClass("active");
            // toggle class on icon
            $(this).parent().children(".checkboxs_check:first-child").addClass("active");
        }

    });

    $(".newsletter__interest-area__list .filters__field-bottom label").on('click', function () {
        $(this).parent().toggleClass('checked');
        $(this).prev().children("input[type='checkbox']").toggleClass('checked');

        if ($(this).prev().children("input[type='checkbox']").hasClass('checked')) {
            // toggle status of input checkbox
            $(this).prev().children("input[type='checkbox']").attr("checked", true);
            // toggle class on icon
            $(this).prev().children(".checkboxs_check").addClass("active");
        } else {
            $(this).prev().children("input[type='checkbox']").attr("checked", false);
            // toggle status of input checkbox
            $(this).prev().children(".checkboxs_check").removeClass("active");
            // toggle class on icon
            $(this).prev().children(".checkboxs_check:first-child").addClass("active");
        }

    });

    $(".newsletter-termos .filters__field-bottom label").on('click', function () {
        $(this).parent().toggleClass('checked');
        $(this).prev().children("input[type='checkbox']").toggleClass('checked');

        if ($(this).prev().children("input[type='checkbox']").hasClass('checked')) {
            // toggle status of input checkbox
            $(this).prev().children("input[type='checkbox']").attr("checked", true);
            // toggle class on icon
            $(this).prev().children(".checkboxs_check").addClass("active");
        } else {
            $(this).prev().children("input[type='checkbox']").attr("checked", false);
            // toggle status of input checkbox
            $(this).prev().children(".checkboxs_check").removeClass("active");
            // toggle class on icon
            $(this).prev().children(".checkboxs_check:first-child").addClass("active");
        }

    });

    $("form label").click(function () {
        $(this).parent().toggleClass('checked');
        $(this).prev().children("input[type='checkbox']").toggleClass('checked');

        if ($(this).prev().children("input[type='checkbox']").hasClass('checked')) {
            // toggle status of input checkbox
            $(this).prev().children("input[type='checkbox']").attr("checked", true);
            // toggle class on icon
            $(this).prev().children(".checkboxs_check").addClass("active");
        } else {
            $(this).prev().children("input[type='checkbox']").attr("checked", false);
            // toggle status of input checkbox
            $(this).prev().children(".checkboxs_check").removeClass("active");
            // toggle class on icon
            $(this).prev().children(".checkboxs_check:first-child").addClass("active");
        }

    });


    /*$(".newsletter .form-field").click(function () {
        $(".newsletter__interest-area").show();
    });

    $('body').click(function () {
        $(".newsletter__interest-area").hide();
    });*/

    $('.newsletter').click(function (e) {
        e.stopPropagation();
    });

    $("#ordem label").click(function () {
        var item_selected = $(this).text();
        var data_value = $(this).attr("data-value");

        $(".filters__field-text--ordem").text(item_selected);

        final = false;
        $("#pagination_position").val(0);

        $('#product-list .product-itens').html('');

        // clean options
        $("#filter_order option:selected").removeAttr("selected");

        // select option selected
        $("#filter_order option[value=" + data_value + "]").attr("selected", true);
        // hide select input
        $("#ordem").hide();
    });


});

function initMap() {


    var maplace = new Maplace({
        map_div: '#map',
        controls_on_map: false,
        styles: {
            "Default": [{
                "elementType": "geometry",
                "stylers": [{
                    "color": "#212121"
                }]
            },
                {
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                },
                {
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#757575"
                    }]
                },
                {
                    "elementType": "labels.text.stroke",
                    "stylers": [{
                        "color": "#212121"
                    }]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#000000"
                    },
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "administrative.country",
                    "stylers": [{
                        "color": "#000000"
                    },
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "administrative.country",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#9e9e9e"
                    }]
                },
                {
                    "featureType": "administrative.land_parcel",
                    "stylers": [{
                        "visibility": "on"
                    }]
                },
                {
                    "featureType": "administrative.locality",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#bdbdbd"
                    }]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#757575"
                    }]
                },
                {
                    "featureType": "poi.park",
                    "stylers": [{
                        "visibility": "on"
                    }]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#181818"
                    },
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#616161"
                    }]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "labels.text.stroke",
                    "stylers": [{
                        "color": "#1b1b1b"
                    }]
                },
                {
                    "featureType": "road",
                    "stylers": [{
                        "visibility": "on"
                    }]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry.fill",
                    "stylers": [{
                        "color": "#ffffff"
                    }]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#8a8a8a"
                    }]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#676767"
                    }]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "labels",
                    "stylers": [{
                        "color": "#c9c9c9"
                    },
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#c9c9c9"
                    }]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "labels",
                    "stylers": [{
                        "visibility": "on"
                    }]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "labels.icon",
                    "stylers": [{
                        "visibility": "off"
                    }]
                },
                {
                    "featureType": "road.highway.controlled_access",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#676767"
                    }]
                },
                {
                    "featureType": "road.highway.controlled_access",
                    "elementType": "labels",
                    "stylers": [{
                        "visibility": "on"
                    }]
                },
                {
                    "featureType": "road.highway.controlled_access",
                    "elementType": "labels.text",
                    "stylers": [{
                        "visibility": "off"
                    }]
                },
                {
                    "featureType": "road.local",
                    "stylers": [{
                        "visibility": "off"
                    }]
                },
                {
                    "featureType": "road.local",
                    "elementType": "labels",
                    "stylers": [{
                        "color": "#616161"
                    },
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#616161"
                    }]
                },
                {
                    "featureType": "transit",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#757575"
                    }]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry",
                    "stylers": [{
                        "color": "#000000"
                    },
                        {
                            "visibility": "on"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [{
                        "color": "#3d3d3d"
                    }]
                }
            ]
        }
    });

    var hash = location.hash.substr(1);

    var id_pais = 3;

    if (hash != '') {
        id_pais = $('.item-' + hash).data('load');
    }

    showGroup(id_pais);

    $('.news-list li a').click(function (e) {
        e.preventDefault();
        var index = $(this).attr('data-load');
        showGroup(index);
    });


    function showGroup(index) {
        var el = $('#g' + index);
        $('#tabs li').removeClass('active');
        $(el).parent().addClass('active');
        $.getJSON(siteUrl + 'ajax.php?action=getMaps&lang=' + siteLang+'&paisIp='+paisIp, {
            type: index
        }, function (data) {
            //loads data into the map
            maplace.Load({
                locations: data.locations,
                view_all_text: data.title,
                type: data.type,
                force_generate_controls: true
            });
        });
    }



    /*var map = new google.maps.Map(document.getElementById('map'), {
    	zoom: 8,
    	center: uluru,
    	styles: [{
    			"elementType": "geometry",
    			"stylers": [{
    				"color": "#212121"
    			}]
    		},
    		{
    			"elementType": "geometry.fill",
    			"stylers": [{
    				"color": "#323232"
    			}]
    		},
    		{
    			"elementType": "labels",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"elementType": "labels.icon",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"elementType": "labels.text.fill",
    			"stylers": [{
    				"color": "#757575"
    			}]
    		},
    		{
    			"elementType": "labels.text.stroke",
    			"stylers": [{
    				"color": "#212121"
    			}]
    		},
    		{
    			"featureType": "administrative",
    			"elementType": "geometry",
    			"stylers": [{
    				"color": "#757575"
    			}]
    		},
    		{
    			"featureType": "administrative.country",
    			"elementType": "geometry.fill",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "administrative.country",
    			"elementType": "geometry.stroke",
    			"stylers": [{
    				"color": "#2b2b2b"
    			}]
    		},
    		{
    			"featureType": "administrative.country",
    			"elementType": "labels.text.fill",
    			"stylers": [{
    				"color": "#9e9e9e"
    			}]
    		},
    		{
    			"featureType": "administrative.land_parcel",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "administrative.land_parcel",
    			"elementType": "geometry.fill",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "administrative.locality",
    			"elementType": "labels.text.fill",
    			"stylers": [{
    				"color": "#bdbdbd"
    			}]
    		},
    		{
    			"featureType": "administrative.neighborhood",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "administrative.province",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "administrative.province",
    			"elementType": "geometry.stroke",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "poi",
    			"elementType": "labels.text.fill",
    			"stylers": [{
    				"color": "#757575"
    			}]
    		},
    		{
    			"featureType": "poi.business",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "poi.park",
    			"elementType": "geometry",
    			"stylers": [{
    				"color": "#181818"
    			}]
    		},
    		{
    			"featureType": "poi.park",
    			"elementType": "labels.text",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "poi.park",
    			"elementType": "labels.text.fill",
    			"stylers": [{
    				"color": "#616161"
    			}]
    		},
    		{
    			"featureType": "poi.park",
    			"elementType": "labels.text.stroke",
    			"stylers": [{
    				"color": "#1b1b1b"
    			}]
    		},
    		{
    			"featureType": "road",
    			"elementType": "geometry.fill",
    			"stylers": [{
    				"color": "#2c2c2c"
    			}]
    		},
    		{
    			"featureType": "road",
    			"elementType": "labels.text.fill",
    			"stylers": [{
    				"color": "#8a8a8a"
    			}]
    		},
    		{
    			"featureType": "road.arterial",
    			"elementType": "geometry",
    			"stylers": [{
    				"color": "#373737"
    			}]
    		},
    		{
    			"featureType": "road.arterial",
    			"elementType": "labels",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "road.highway",
    			"elementType": "geometry",
    			"stylers": [{
    				"color": "#3c3c3c"
    			}]
    		},
    		{
    			"featureType": "road.highway",
    			"elementType": "labels",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "road.highway.controlled_access",
    			"elementType": "geometry",
    			"stylers": [{
    				"color": "#4e4e4e"
    			}]
    		},
    		{
    			"featureType": "road.local",
    			"stylers": [{
    				"visibility": "off"
    			}]
    		},
    		{
    			"featureType": "road.local",
    			"elementType": "labels.text.fill",
    			"stylers": [{
    				"color": "#616161"
    			}]
    		},
    		{
    			"featureType": "transit",
    			"elementType": "labels.text.fill",
    			"stylers": [{
    				"color": "#757575"
    			}]
    		},
    		{
    			"featureType": "water",
    			"elementType": "geometry",
    			"stylers": [{
    				"color": "#000000"
    			}]
    		},
    		{
    			"featureType": "water",
    			"elementType": "geometry.fill",
    			"stylers": [{
    				"color": "#2b2b2b"
    			}]
    		},
    		{
    			"featureType": "water",
    			"elementType": "labels.text.fill",
    			"stylers": [{
    				"color": "#3d3d3d"
    			}]
    		}
    	]
    });*/
    // var marker = new google.maps.Marker({
    // 	position: uluru,
    // 	map: map
    // });
}



$(window).scroll(function () {
    var top_of_element = $(".footer").offset().top;
    var bottom_of_element = $(".footer").offset().top + $(".footer").outerHeight();
    var bottom_of_screen = $(window).scrollTop() + window.innerHeight;
    var top_of_screen = $(window).scrollTop();

    if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
        // The element is visible, do something
        $('.floater-toggler').addClass('floater-toggler--stop');
        $('.floater-toggler').css('bottom', $(".footer").outerHeight() + 20);
    } else {
        // The element is NOT visible, do something else
        $('.floater-toggler').removeClass('floater-toggler--stop');
        $('.floater-toggler').removeAttr('style');
    }
});



$(window).resize(function () {
    setHeight(".banner--fixed");
    setHeight(".banner--large");
    imageheight_product();


    if ($(window).width() > 768) {

        $(".filters .filters__field-bottom").css({
            "top": $(".filters .filters__field-top").outerHeight() + "px"
        });

        $('.bottombar .bottombar__menu_top .logo-link img').attr('src',siteUrl+'assets/img/logo.png')
    } else {

        $(".filters .filters__field-bottom").css({
            "top": "0px"
        });

        $('.bottombar .bottombar__menu_top .logo-link img').attr('src',siteUrl+'assets/img/logo_blk.png')

    }

    if ($(window).width() < 768) {

        var html = $(".first-column .bottombar__menu_middle-content:nth-child(2)");
        $(".third-column .bottombar__menu_middle-content").after(html);

    } else {

        var html = $(".third-column .bottombar__menu_middle-content:nth-child(2)");
        $(".first-column .bottombar__menu_middle-content").after(html);

    }

});

var lastScrollTop = 0;

$(window).scroll(function () {
    var ontop = $(this).scrollTop();
    var st = $(this).scrollTop();

    if (ontop == 0) {
        // i am on top
        $(".topbar").removeClass("active");
    } else {
        $(".topbar").addClass("active");
    }

    $(".banner--fixed .banner__masked--1").css({
        opacity: function () {
            var elementHeight = $(this).height(),
                opacity = ((1 - (elementHeight - ontop) / elementHeight) * 1.4) + .3;

            return opacity;
        }
    });
    // console.log("window: " + $(window).width(), "scroll: " + ontop, "banner Height: " + $("#banner1").outerHeight(), "banner offset: " + $("#banner1").offset().top );
    if($("#banner1").length > 0){
        if(ontop >= $("#banner1").outerHeight() - $("#banner1").offset().top){
            $("#banner1").css({
                opacity: function () {
                    var elementHeight = $(this).height(),
                        opacity = ((0 + (elementHeight - ontop) / elementHeight) * 1.4) + 1;

                    return opacity;
                }
            });
        }
    }



    if ($(window).width() > 768) {

        var docHeight = $(document).height();
        var winHeight = $(window).height();
        var count = 1;

        // $(".masked").each(function () {

        //     var elTop = $(this).offset().top;
        //     var elBot = elTop - winHeight;
        //     var ref = count - 1;

        //     if ($(window).scrollTop() > elBot && $(window).scrollTop() < elTop) {

        //         var percent = parseInt($('.masked:eq(' + ref + ')').attr('data'));

        //         if (percent < 100 && st > lastScrollTop) {

        //             percent = percent + 1;
        //             $('.masked:eq(' + ref + ')').attr('data', percent);
        //             $('.masked:eq(' + ref + ') .banner--large').css({
        //                 "width": percent + "%"
        //             });

        //             $(".masked-" + ref + "").attr('data', '100');
        //             $(".masked-" + ref + "").children('.banner--large').css({
        //                 width: "100%"
        //             });

        //         } else if (st < lastScrollTop && percent > 60) {

        //             percent = percent - 1;

        //             $(".masked:eq(" + ref + ")").attr('data', percent);
        //             $('.masked:eq(' + ref + ') .banner--large').css({
        //                 "width": percent + "%"
        //             });

        //         }

        //     }
        //     count++;
        // });

        lastScrollTop = st;


    }



});

function selectItemContact() {

    var hash = location.hash.substr(1);

    if (hash != '') {
        id_item = $('.item-' + hash).data('load');
        $('.news-list__item-link').removeClass('selected');
        $('.contact-list_related-info').removeClass('selected');
        $('.item-' + hash).addClass('selected');
        $('#' + id_item + '.contact-list_related-info').addClass('selected');
    }
}

// set item min height
function setHeight(item) {
    $(item).css({
        "min-height": $(window).outerHeight()
    });
}

function carrousel() {

    var story_swiper = new Swiper('.story-swiper', {
        pagination: {
            el: '.swiper-pagination--custom',
            renderBullet: function (index, className) {
                return '<span class="' + className + '">' + $(".swiper-wrapper .swiper-slide:eq(" + index + ")").data("year") + '</span>';
            },
            dynamicBullets: true,
            clickable: true
        },
        paginationType: "custom",
        paginationClickable: true,
    });

    story_swiper.on('slideChange', function () {
        // if ($(".story-swiper .swiper-pagination-bullet:first-child").hasClass("swiper-pagination-bullet-active")) {
        // 	$('.story-swiper__nav .prev').hide();
        // } else {
        // 	$('.story-swiper__nav .prev').show();
        // }

        // if ($(".story-swiper .swiper-pagination-bullet:last-child").hasClass("swiper-pagination-bullet-active")) {
        // 	$('.story-swiper__nav .next').hide();
        // } else {
        // 	$('.story-swiper__nav .next').show();
        // }
    });

    $('.story-swiper__nav .next').on('click', function (e) {
        e.preventDefault();
        story_swiper.slideNext();
    });

    $('.story-swiper__nav .prev').on('click', function (e) {
        e.preventDefault();
        story_swiper.slidePrev();
    });

    // if ($(".story-swiper .swiper-pagination-bullet:first-child").hasClass("swiper-pagination-bullet-active")) {
    // 	$('.story-swiper__nav .prev').hide();
    // } else {
    // 	$('.story-swiper__nav .prev').show();
    // }


    var swiper = new Swiper('.swiper-certifications .swiper-infinite', {
        navigation: {
            nextEl: '.swiper-certifications .swiper-button-next',
            prevEl: '.swiper-certifications .swiper-button-prev',
        },
        pagination: {
            //el: '.swiper-infinite .swiper-pagination',
            clickable: true,
        },
        speed: 1,
        effect: 'fade',
        loop: false,
        autoplay: {
            delay: 10000,
        }
    });

    var swiperCompany = new Swiper('.company-values .swiper-infinite', {
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            //el: '.company-values .swiper-infinite .swiper-pagination',
            clickable: true,
        },
        speed: 1,
        effect: 'fade',
        loop: false,
        // autoplay: {
        //     delay: 4000,
        // },
    });

}

$("body").on('click', ".contact-list .news-list__item-link", function () {
    var target = $(this).data("article");
    // items on menu left side
    $(".news-list .news-list__item-link").removeClass("selected");
    $(this).addClass("selected");

    // article selected
    $(".contact-list .contact-list_related-info").removeClass("selected");
    $("#" + target).addClass("selected");

    return false;
});

if($(window).width() > 768){
    $("body,html").click(function () {
        $(".filters__field-top").removeClass("open");
        $(".filters__field-bottom").hide();
    });
}

$("body").on("click", ".filters__field-top", function (e) {
    var target = $(this).attr("data-target");

    $("#" + target).toggle();
    $(this).toggleClass("open");

    e.stopPropagation();
    e.preventDefault();
});


$("body").on("click", ".filters__field-bottom", function (e) {
    e.stopPropagation();
    var qtd = $(this).children('li.checked').length;

    if (qtd < 1) {
        $(this).prev().children('.filters__field-qty').text('');
    } else {

        $(this).prev().children('.filters__field-qty').text(qtd);
    }
});

$("body").on("click", ".product-list .list-item", function () {
    $(this).toggleClass("selected");
    $(this).removeAttr("style");
    if ($(this).hasClass("selected")) {
        $(".product-list li").removeClass("selected");
        $(this).addClass("selected");
        var cod_produto = $(this).data('produto');
        var item = $(this);

        var formData = new FormData(),xhr = new XMLHttpRequest();

        formData.append('lang', siteLang);
        formData.append('cod_produto', cod_produto);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var data = JSON.parse(xhr.responseText);
                item.children(".product-list__item-expander").html(data.produto);
                $(".measure").css({ width : $(".measure").attr("data-measure") + "cm" });

                setMagnifier();
            }
        }

        xhr.open("POST", "?action=ajax");
        xhr.send(formData);



        var itemHeight = $(this).outerHeight();
        var childHeight = $(this).children(".product-list__item").outerHeight(true);
        var childExpanderHeight = $(this).children(".product-list__item-expander").outerHeight(true);
        var calc = "";
        $(".product-list li").css({
            height: "auto"
        });

        $(this).css({
            height: calc + "px"
        });

        if ($(window).width() < 768) {
            // calc = childHeight + childExpanderHeight;
            // $(".product-list li").css({ height : "auto"});
            // $(this).css({ height: calc + "px" });
            calc = "";
            $(this).removeAttr("style");
        } else {
            calc = childHeight + 780;
            $(".product-list li").css({
                height: "auto"
            });
            $(this).css({
                height: calc + "px"
            });
        }

        if($(window).width() > 992 && $(window).width() < 1500){
            calc = childHeight + 590
            $(".product-list li").css({
                height: "auto"
            });
            $(this).css({
                height: calc + "px"
            });
        }
    }

    // var target = $(this).attr('data-target');
    $('html, body').animate({
        scrollTop: $(this).offset().top - 100,
    }, 500);
    
    return false;
});

$("body").on("click", ".product-list__item-close", function (e) {
    $(this).closest('.list-item').removeClass('selected');
    e.preventDefault();
});


$("body").on("click", ".product-list li .product-list__item-expander", function (e) {
    e.stopPropagation();
});

$("body").on("click", ".product-list li .product-list__item-expander li", function (e) {
    return false;
});

$("body").on("click", ".product-list__item-expander .swiper-container .swiper-slide", function (e) {
    $(this).closest(".product-list__item-expander").children(".light-window").addClass("active");
    e.stopPropagation();
});

$("body").on("click", ".product-list__item-expander .light-window__close", function (e) {
    $(this).closest(".product-list__item-expander").children(".light-window").removeClass("active");
    return false;
});

$("body").on("click", ".sample-modal .sample-modal__close, .snip-modal .snip-modal__close, .sample-modal-newsletter .sample-modal__close", function (e) {
    $(".sample-modal, .snip-modal, .sample-modal-newsletter").removeClass("active");
    return false;
});
$("body").on("click", ".ask-sample", function (e) {
    var produto = $(this).data('name');
    var text = $(this).data('text');
    $(".snip-modal #subject").val(text+' - '+produto);
    $(".snip-modal").addClass("active");
    return false;
});
$("body").on("click", ".floater-toggler", function () {
    $(".sample-modal").addClass("active");
});

$(".btn-newsletter").click(function () {
    $(".sample-modal-newsletter").addClass("active");
    return false;
});

$("body,html").on('click', '.candidatura-btn',function () {
    $(".modal-candidatura").addClass("active");
    return false;
});
$("body").on("click", ".form label.subject", function (e) {
    $(this).removeClass("active");
    return false;
});
$("body").on("click", ".form select", function (e) {
    $(this).parent().toggleClass("active");

    return false;
});

$("body").on("click", ".contact-list .more-services", function () {
    $(this).parent().children("ul").toggle();
    return false;
});

$('body').on('click', '.filters__paragraph', function (e) {
    e.stopPropagation();
    e.preventDefault();
    if ($(document).width() < 1100) {
        $('.filter').slideToggle();
        $(".filters-toggle").toggleClass("active");
    }
});


$("body").on("click", ".bottombar .bottombar__menu_middle-content > .arrow-calcado", function (e) {
    $(this).parent().children(".bottombar__menu_middle-content__item").addClass("active");
    // setTimeout(function () {
    //     $(".search-field").hide();
    // }, 300);

});

$("body").on("click", ".bottombar .bottombar__menu_middle-content > button", function (e) {
    $(this).parent().children(".bottombar__menu_middle-content__item").addClass("active");
    // setTimeout(function () {
    //     $(".search-field").hide();
    // }, 300);

});

$("body").on("click", ".bottombar .bottombar__menu_middle-content__item button", function (e) {
    // $(".search-field").show();
    $(".bottombar__menu_middle-content__item").removeClass("active");
    // return false;
});

$("body").on("click", ".footer__block--click", function () {
    $(this).toggleClass("open");
    $(this).children(".footer__block_text").toggleClass("toggle");

});


/*var currHeight = 0;
if ($(document).width() >= 768) {
    $('.footer-contact').each(function(){
        if ( $(this).outerHeight() > currHeight ) {
            currHeight = $(this).outerHeight();
        } else {
            $(this).height(currHeight);
        }
    });
}*/

$("body").on("click", ".pushState", function (e) {

    $urlState = window.location.pathname;
    $titleState = document.title;

    var $pushUrl = $(this).attr('data-url');
    var $pushTitle = $(this).attr('data-title');

    history.pushState('', null, $pushUrl);
    $(document).attr('title', $pushTitle);

    $.get($pushUrl, function (data) {
        data = $(data).find('.articles article').html();
        $(".article-wrapper").html(data);

    });
    $(".news-list .news-list__item-link").removeClass("selected");
    $(this).addClass("selected");

    $(".articles").toggleClass("active");

    // article selected
    $(".news-template article").removeClass("selected");
    $("#article-content").addClass("selected");
    return false;
});


if ($(window).width() < 768) {

    $("body").on("click", "article h2", function (e) {
        $(".articles").removeClass("active");
    });
}


if ($(".form").length) {
    var textarea = document.querySelector('textarea');

    textarea.addEventListener('keydown', autosize);

    function autosize() {
        var el = this;
        setTimeout(function () {
            el.style.cssText = 'height:auto; padding:0';
            el.style.cssText = 'height:' + el.scrollHeight + 'px';
        }, 0);
    }
}


function onInitialize() {
    $(".banner--fixed").addClass("initialized");
    if ($(window).width() > 768) {
        // $(".banner--fixed .banner--large").addClass("active");

        setTimeout(function () {
            $(".banner__masked").addClass("active");
        }, 1300);

        setTimeout(function () {
            $(".banner--fixed h1, .banner--fixed h2").addClass("initialized");
        }, 2000);

        setTimeout(function () {
            $(".topbar").addClass("initialized");
        }, 3000);

        setTimeout(function () {
            $(".go, main .btn").addClass("initialized");
        }, 3900);
    } else {

        $(".banner__masked").addClass("active");

        $(".banner--fixed h1, .banner--fixed h2").addClass("initialized");

        $(".topbar").addClass("initialized");

        $(".go, main .btn").addClass("initialized");
    }



}

function onload() {

    $(".btn-submit").click(function (e) {
        e.preventDefault();
        var $form = $(this).closest('.contactForm');
        $form.addClass('active');
        validate($form);
    });

    $(".btn-submit-candidatura").click(function (e) {
        e.preventDefault();
        var $form = $(this).closest('.formCandidatura');
        $form.addClass('active');
        validate($form);
    });
}

function validate($form) {


    if ($form[0].checkValidity()) {
        //grecaptcha.execute();
    } else {
        $form[0].reportValidity()
    }


}


$("body").on("click", ".carrers-list__item-link", function () {
    $(this).parent().toggleClass("selected");

    if ($(this).parent().hasClass("selected")) {
        $(".carrers-list__item").removeClass("selected");
        $(this).parent().addClass("selected");
    }

    return false;
});

$("body").on("click", ".carrers-list__item ul li a", function () {
    $(".carrers-list__item ul li a").removeClass("selected");
    $(this).addClass("selected");

    return false;
});

function sendNewsletter() {
    $('.newsletter').submit(function (e) {
        e.preventDefault();
        var form = this;
        $(form).addClass('active');
        var form = document.querySelector('.newsletter.active'),
            formData = new FormData(form),
            xhr = new XMLHttpRequest();

        formData.append('lang', siteLang);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var resp = JSON.parse(xhr.responseText);
                $(form).removeClass('active');
                //$('.newsletter__interest-area').hide();
                if (resp) {
                    $("#alertNewsletter").addClass('alert-danger');
                    $("#alertNewsletter").removeClass('alert-success');
                    $("#alertNewsletter").css("display", "block");
                    $("#alertNewsletter").text(resp.msg);
                    $('#alertNewsletter').delay(2000).fadeOut('slow');
                    return;
                } else {
                    $("#alertNewsletter").removeClass('alert-danger');
                    $("#alertNewsletter").addClass('alert-success');
                    $("#alertNewsletter").css("display", "block");
                    $("#alertNewsletter").text(resp.msg);
                    $('#alertNewsletter').delay(2000).fadeOut('slow');
                }
            }
        }
        xhr.open("POST", siteUrl + "ajax.php?action=addNewsletter");
        xhr.send(formData);
    });
}

function sendForm() {

    var btn_text = $('.contactForm.active .btn-submit').text();
    var btn_send = $('.contactForm.active .btn-submit').data('text-send');
    $('.contactForm.active .btn-submit').attr('disabled', 'disabled').html('<img src="' + siteUrl + 'assets/img/loader.svg" style="width:16px; margin-right: 15px" alt="loading">' + btn_send);


    var form = document.querySelector('.contactForm.active'),
        formData = new FormData(form),
        xhr = new XMLHttpRequest();

    formData.append('lang', siteLang);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var resp = JSON.parse(xhr.responseText);
            if (!resp.error) {
                $('.contactForm.active .alert').html(resp.msg);
                $('.contactForm.active .alert').removeClass('alert-danger');
                $('.contactForm.active .alert').addClass('alert-success');
                $('.contactForm.active .alert').show();
                $('.contactForm.active')[0].reset();
                $('.contactForm.active .btn-submit').removeAttr('disabled').html(btn_text);
                $('.contactForm.active').removeClass('active');
            } else {
                $('.contactForm.active .alert').html(resp.msg);
                $('.contactForm.active .alert').removeClass('alert-success');
                $('.contactForm.active .alert').addClass('alert-danger');
                $('.contactForm.active .alert').show();
                $('.contactForm.active .btn-submit').removeAttr('disabled').html(btn_text);
                $('.contactForm.active').removeClass('active');
            }
        }
    }


    xhr.open("POST", siteUrl + "ajax.php?action=sendContact");
    xhr.send(formData);

    //grecaptcha.reset();
}
function formRegisto() {
    var btn_text = $('#formRegisto #buttonRegisto').text();
    var btn_send = $('#formRegisto #buttonRegisto').data('text-send');
    $('#formRegisto #buttonRegisto').attr('disabled', 'disabled').html('<img src="' + siteUrl + 'assets/img/loader.svg" style="width:16px; margin-right: 15px" alt="loading">' + btn_send);


    var form = document.querySelector('.form.registo'),
        formData = new FormData(form),
        xhr = new XMLHttpRequest();

    formData.append('lang', siteLang);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var resp = JSON.parse(xhr.responseText);
            if (!resp.error) {
                $('#formRegisto .alert').html(resp.msg);
                $('#formRegisto .alert').removeClass('alert-danger');
                $('#formRegisto .alert').addClass('alert-success');
                $('#formRegisto .alert').show();
                $('#formRegisto')[0].reset();
                $('#formRegisto #buttonRegisto').removeAttr('disabled').html(btn_text);
                $('#formRegisto').removeClass('active');
            } else {
                $('#formRegisto .alert').html(resp.msg);
                $('#formRegisto .alert').removeClass('alert-success');
                $('#formRegisto .alert').addClass('alert-danger');
                $('#formRegisto .alert').show();
                $('#formRegisto #buttonRegisto').removeAttr('disabled').html(btn_text);
                $('#formRegisto').removeClass('active');
            }
        }
    }

    xhr.open("POST", siteUrl + "ajax.php?action=register");
    xhr.send(formData);

    //grecaptcha.reset();
}
function formLogin() {
    var btn_text = $('#formLogin #buttonLogin').text();
    var btn_send = $('#formLogin #buttonLogin').data('text-send');
    $('#formLogin #buttonLogin').attr('disabled', 'disabled').html('<img src="' + siteUrl + 'assets/img/loader.svg" style="width:16px; margin-right: 15px" alt="loading">' + btn_send);


    var form = document.querySelector('.form.login'),
        formData = new FormData(form),
        xhr = new XMLHttpRequest();

    formData.append('lang', siteLang);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var resp = JSON.parse(xhr.responseText);
            if (!resp.error) {
                window.location.href=siteUrl+siteLang+'/';
            } else {
                $('#formLogin .alert').html(resp.msg);
                $('#formLogin .alert').removeClass('alert-success');
                $('#formLogin .alert').addClass('alert-danger');
                $('#formLogin .alert').show();
                $('#formLogin #buttonLogin').removeAttr('disabled').html(btn_text);
                $('#formLogin').removeClass('active');
            }
        }
    }

    xhr.open("POST", siteUrl + "ajax.php?action=login");
    xhr.send(formData);

    //grecaptcha.reset();
}

function sendCandidatura() {

    var btn_text = $('.formCandidatura .btn-submit').text();
    var btn_send = $('.formCandidatura .btn-submit').data('text-send');
    $('.formCandidatura .btn-submit').attr('disabled', 'disabled').html('<img src="' + siteUrl + 'assets/img/loader.svg" style="width:16px; margin-right: 15px" alt="loading">' + btn_send);


    var form = document.querySelector('.formCandidatura'),
        formData = new FormData(form),
        xhr = new XMLHttpRequest();

    formData.append('lang', siteLang);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var resp = JSON.parse(xhr.responseText);
            if (!resp.error) {
                $('.formCandidatura .alert').html(resp.msg);
                $('.formCandidatura .alert').removeClass('alert-danger');
                $('.formCandidatura .alert').addClass('alert-success');
                $('.formCandidatura .alert').show();
                $('.formCandidatura')[0].reset();
                $('.formCandidatura .btn-submit').removeAttr('disabled').html(btn_text);
                $('.formCandidatura').removeClass('active');
            } else {
                $('.formCandidatura .alert').html(resp.msg);
                $('.formCandidatura .alert').removeClass('alert-success');
                $('.formCandidatura .alert').addClass('alert-danger');
                $('.formCandidatura .alert').show();
                $('.formCandidatura .btn-submit').removeAttr('disabled').html(btn_text);
                $('.formCandidatura').removeClass('active');
            }
        }
    }

    xhr.open("POST", siteUrl + "ajax.php?action=sendCandidatura");
    xhr.send(formData);

    //grecaptcha.reset();
}

function passwordLogin() {
    var btn_text = $('#passwordLogin #buttonPassword').text();
    var btn_send = $('#passwordLogin #buttonPassword').data('text-send');
    $('#passwordLogin #buttonPassword').attr('disabled', 'disabled').html('<img src="' + siteUrl + 'assets/img/loader.svg" style="width:16px; margin-right: 15px" alt="loading">' + btn_send);


    var form = document.querySelector('.form.password'),
        formData = new FormData(form),
        xhr = new XMLHttpRequest();

    formData.append('lang', siteLang);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var resp = JSON.parse(xhr.responseText);
            if (!resp.error) {
                $('#passwordLogin .alert').html(resp.msg);
                $('#passwordLogin .alert').removeClass('alert-danger');
                $('#passwordLogin .alert').addClass('alert-success');
                $('#passwordLogin .alert').show();
                $('#passwordLogin')[0].reset();
                $('#passwordLogin #buttonPassword').removeAttr('disabled').html(btn_text);
                $('#passwordLogin').removeClass('active');
            } else {
                $('#passwordLogin .alert').html(resp.msg);
                $('#passwordLogin .alert').removeClass('alert-success');
                $('#passwordLogin .alert').addClass('alert-danger');
                $('#passwordLogin .alert').show();
                $('#passwordLogin #buttonPassword').removeAttr('disabled').html(btn_text);
                $('#passwordLogin').removeClass('active');
            }
        }
    }

    xhr.open("POST", siteUrl + "ajax.php?action=password");
    xhr.send(formData);

    //grecaptcha.reset();
}

function alterarPassword() {
    var btn_text = $('#alterarPassword #buttonAPassword').text();
    var btn_send = $('#alterarPassword #buttonAPassword').data('text-send');
    $('#alterarPassword #buttonAPassword').attr('disabled', 'disabled').html('<img src="' + siteUrl + 'assets/img/loader.svg" style="width:16px; margin-right: 15px" alt="loading">' + btn_send);


    var form = document.querySelector('.form.alterar-password'),
        formData = new FormData(form),
        xhr = new XMLHttpRequest();

    formData.append('lang', siteLang);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var resp = JSON.parse(xhr.responseText);
            if (!resp.error) {
                $('#alterarPassword .alert').html(resp.msg);
                $('#alterarPassword .alert').removeClass('alert-danger');
                $('#alterarPassword .alert').addClass('alert-success');
                $('#alterarPassword .alert').show();
                $('#alterarPassword')[0].reset();
                $('#alterarPassword #buttonAPassword').removeAttr('disabled').html(btn_text);
                $('#alterarPassword').removeClass('active');
            } else {
                $('#alterarPassword .alert').html(resp.msg);
                $('#alterarPassword .alert').removeClass('alert-success');
                $('#alterarPassword .alert').addClass('alert-danger');
                $('#alterarPassword .alert').show();
                $('#alterarPassword #buttonAPassword').removeAttr('disabled').html(btn_text);
                $('#alterarPassword').removeClass('active');
            }
        }
    }
    //alert("asd")
    //grecaptcha.reset();
    xhr.open("POST", siteUrl + "ajax.php?action=alterarpassword");
    xhr.send(formData);

    //grecaptcha.reset();
}


function loadProdutcts() {

    var menu = $('#menu').val();

    // esconder galeria solas likenit

    if(menu == 18 || menu == 19){
        $('.loader').hide();
    }else{
        $('.loader').show();
    }

    var preCheck = loadProductsByUrl();

    if ($("#product-list").length > 0 && preCheck == false) {

        var formData = new FormData(),
            xhr = new XMLHttpRequest();

        formData.append('lang', siteLang);

        var ordem = $('#filter_order').val();
        var totalColecoes = $('#colecoes_total').val();
        var position = $("#pagination_position").val();
        formData.append('start', position);
        formData.append('ordem', ordem);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var data = JSON.parse(xhr.responseText);
                var produto = "";
                var cat = "";

                loadStatus = true;

                final = data.final;
                if(final || (parseInt(position)) == totalColecoes ){
                    $('.verMais').hide();
                }else{
                    $('.verMais').show();
                }
                //$(".product-itens").html("");

                // esconder galeria solas likenit

                if(data.produtos != undefined){
                    if(menu == 18 || menu == 19){
                        $('.loader').hide();
                    }else{
                        loadProdutos(data.produtos);
                    }
                    
                }

                carrousel();

                $('.loader').hide();
            }
        }

        xhr.open("POST", "?action=ajax");
        xhr.send(formData);

    }

}

function loadProdutos(data) {

    $.each(data, function (i, val) {

        var title = '';

        if(val.destaque){
            title = $('.title_destaque').clone().attr('style', '');
            title = title[0]['outerHTML'];
        }


        cat = title+'<div class="col-xs-24 filtered__product">' + val.categoria.toUpperCase() + '</span></div><ul id="products_' + val.cod + '"></ul>';
        $('#product-list .product-itens').append(cat);

        $.each(val.produtos, function (i, produto) {
            produto = '<li class="list-item" data-produto="' + produto.cod_produto + '">' +
                '                            <div class="product-list__item" data-target="#product_' + produto.cod_produto + '">' +
                '                                <a href="#" title="close" class="product-list__item-close"><i class="icon-close"></i></a>' +
                '                                <!-- 177x177 -->' +
                '                                <img src="' + produto.imagem + '" alt="' + produto.produto + '" class="img-responsive full-width">' +
                '                                <div class="product-list__item__detail">' +
                '                                    <p class="product-list__item__detail-title">' + produto.produto + '</p>' +
                '                                    <p class="product-list__items__detail-subtitle">' + produto.colecao + '</p>' +
                '                                </div>' +
                '                            </div>' +
                '                            <div class="product-list__item-expander" id="product_' + produto.cod_produto + '">' +
                '                                ' +
                '                            </div>' +
                '                        </li>';
            $('#product-list .product-itens #products_' + val.cod).append(produto);
        });



    });

    $('.loader').hide();
    loadStatus = true;
}



function loadByScroll() {



    $(".verMais").on("click", function () {
        if (loadStatus == true && final == false) {
            $('.loader').show();

            var position = $("#pagination_position").val();
            $("#pagination_position").val(Number(position) + 4);
            loadProdutcts();
        }
    });


}

function loadProductsByUrl() {

    if ($.urlParam('filters') != "true") {
        return false;
    }

    var aplicacao = $.urlParam('ap');
    var categoria = $.urlParam('ca');
    var colecao = $.urlParam('co');
    var gama = $.urlParam('ga');
    var cor = $.urlParam('cor');
    var filter = false;

    if (aplicacao !== null) {
        checkFilters(aplicacao, 'aplicacao');
        filter = true;
    }
    if (categoria !== null) {
        checkFilters(categoria, 'categoria');
        filter = true;
    }
    if (colecao !== null) {
        checkFilters(colecao, 'colecao');
        filter = true;
    }
    if (cor !== null) {
        checkFilters(cor, 'cores');
        filter = true;
    }
    if (gama !== null) {
        checkFilters(gama, 'gama');
        filter = true;
    }

    if (filter == false) {
        return false;
    }

    filtros(false);

    return filter;
}

function ordenacao() {
    $('#filter_order').on('change', function () {
        filtros(false);

    });
}

function checkFilters(values, classe) {


    $.each(values, function (i, val) {
        $('li.' + classe + val).addClass('checked').show();
        $('li.' + classe + val + ' input').addClass('checked').attr('checked', true);
        $('li.' + classe + val + ' .icon-unchecked').removeClass('active');
        $('li.' + classe + val + ' .icon-checked').addClass('active');
    });

    var qtd = $('#' + classe).children('li.checked').length;
    $('#' + classe).prev().children('.filters__field-qty').text(qtd);

    return true;
}

function filtros(id) {



    //Aplicação
    var aplicacao = [];
    $("#aplicacao input.checked:checked").each(function () {
        aplicacao.push($(this).val());
    });


    //Categoria
    var categoria = [];
    $("#categoria input.checked:checked").each(function () {
        categoria.push($(this).val());
    });


    //Coleção
    var colecao = [];
    $("#colecao input.checked:checked").each(function () {
        colecao.push($(this).val());
    });

    //Gama de cor
    var gama = [];
    $("#gama input.checked:checked").each(function () {
        gama.push($(this).val());
    });

    //Gama de cor
    var cor = [];
    $("#cores input.checked:checked").each(function () {
        cor.push($(this).val());
    });

    $('.loader').show();

    var getUrl = '?filters=true';

    if (!$.isEmptyObject(aplicacao)) {
        getUrl += '&ap=' + toUrl(aplicacao);
    }
    if (!$.isEmptyObject(categoria)) {
        getUrl += '&ca=' + toUrl(categoria);
    }
    if (!$.isEmptyObject(colecao)) {
        getUrl += '&co=' + toUrl(colecao);
    }
    if (!$.isEmptyObject(gama)) {
        getUrl += '&ga=' + toUrl(gama);
    }
    if (!$.isEmptyObject(cor)) {
        getUrl += '&cor=' + toUrl(cor);
    }

    if (id != false) {
        var url = window.location.href.split('?')[0];
        window.history.pushState(null, null, url + getUrl);
    }

    var ordem = $('#filter_order').val();

    var formData = new FormData(),
        xhr = new XMLHttpRequest();

    var position = $("#pagination_position").val();

    formData.append('start', position);
    formData.append('aplicacao', aplicacao);
    formData.append('categoria', categoria);
    formData.append('colecao', colecao);
    formData.append('gama', gama);
    formData.append('cor', cor);
    formData.append('ordem', ordem);


    loadStatus = false;

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var data = JSON.parse(xhr.responseText);

            if (data.filtros != "") {
                updateFilters(data.filtros, id);
            }

            final = data.final;

            if(final){
                 $('.verMais').hide();
             }else{
                 $('.verMais').show();
            }


            if(Object.keys(data.produtos).length > 0){
                //$("#product-list .product-itens").html("");
                loadProdutos(data.produtos);
            }

            carrousel();
            $('.loader').hide();
        }
    }

    xhr.open("POST", "?action=ajax");
    xhr.send(formData);
}

function updateFilters(data, id) {

    var filtros = [{
        'group': 'categoria',
        'fields': {
            'id': 'cod_categoria',
            'name': 'categoria_' + siteLang
        }
    },
        {
            'group': 'colecao',
            'fields': {
                'id': 'cod_colecao',
                'name': 'colecao'
            }
        },
        {
            'group': 'gama',
            'fields': {
                'id': 'cod_gama',
                'name': 'gama_' + siteLang
            }
        },
        {
            'group': 'cores',
            'fields': {
                'id': 'cod_cor',
                'name': 'cor_' + siteLang
            }
        },
        {
            'group': 'aplicacao',
            'fields': {
                'id': 'cod_aplicacao',
                'name': 'aplicacao_' + siteLang
            }
        }
    ];

    var total = $('.filter ul li input:checked').length;

    $.each(filtros, function (i, val) {

        if (id != val['group'] || total == 0) {

            $("#" + val['group'] + ' li').hide();

            $.each(data[val['group']], function (index, option) {

                $("#" + val['group'] + ' li input').each(function () {

                    if ($(this).val() == option[val['fields']['id']]) {
                        var cat = 'li.' + val['group'] + option[val['fields']['id']];
                        $(cat).show();
                    }
                });
            });
        }
    });
}

function verTodasCores() {

    $(document.body).on('click', '.verTodasCores', function (e) {
        e.preventDefault();

        var colecao = $(this).data('colecao');
        $('li.colecao' + colecao).addClass('checked').show();
        $('li.colecao' + colecao + ' input').addClass('checked').attr('checked', true);
        $('li.colecao' + colecao + ' .icon-unchecked').removeClass('active');
        $('li.colecao' + colecao + ' .icon-checked').addClass('active');
        $('#colecao').prev().children('.filters__field-qty').text(1);
        $('#product-list .product-itens').html("");
        $("#pagination_position").val("0");
        filtros('colecao');
        return true;
    });

}

function verRelacionadas() {

    $(document.body).on('click', '.verRelacionadas', function (e) {
        e.preventDefault();

        var colecoes = $(this).data('relacionadas');
        var z = 0;
        $.each(colecoes, function (i, colecao) {
            $('li.colecao' + colecao).addClass('checked').show();
            $('li.colecao' + colecao + ' input').addClass('checked').attr('checked', true);
            $('li.colecao' + colecao + ' .icon-unchecked').removeClass('active');
            $('li.colecao' + colecao + ' .icon-checked').addClass('active');
            z++;
        });
        $('#colecao').prev().children('.filters__field-qty').text(z);
        $('#product-list .product-itens').html("");
        $("#pagination_position").val("0");
        filtros('colecao');
        return true;
    });
}

function clearFilters() {
    $('.clearFilters').click(function (e) {
        e.preventDefault();
        $('.filter ul li').show();
        $('.filter ul li').removeClass('checked');
        $('.filter ul li input').removeClass('checked').attr('checked', false);
        $('.filter ul li .icon-unchecked').addClass('active');
        $('.filter ul li .icon-checked').removeClass('active');
        $('.filters__field-qty').text('');

        var url = window.location.href.split('?')[0];
        window.history.pushState(null, null, url);
        $('#product-list .product-itens').html("");
        $("#pagination_position").val("0");
        loadProdutcts();
    });
}

function toUrl(obj) {
    var url = '';
    $.each(obj, function (i, val) {
        if (i != 0) {
            url += '-';
        }
        url += val;
    });
    return url;
}

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    } else {
        return decodeURI(results[1]).split('-') || 0;
    }
}
// Cookies functions
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function hashTag() {
    hash = document.location.hash;
    if (hash != "") {
        setTimeout(function () {
            if (location.hash) {

                var top = document.getElementById(hash.replace('#', ''));
                if(top != undefined){
                    window.scrollTo(0, top.offsetTop); //Getting Y of target element
                }
            }
        }, 1);
    } else {
        return false;
    }
}
// Cookies functions END
function share(type, url){

    var winHeight = 200;
    var winWidth = 450;
    var winTop = (screen.height / 2) - (winHeight / 2);
    var winLeft = (screen.width / 2) - (winWidth / 2);

    if(type == "facebook") {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
    } else if(type == "twitter") {
        window.open('https://twitter.com/share?url=' + url, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
    } else if(type == "pinterest") {
        window.open('http://www.pinterest.com/pin/create/button/?url=' + url, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
    } else if(type == "googleplus") {
        window.open('https://plus.google.com/share?url=' + url, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
    } else if(type == "linkedin") {
        window.open('https://www.linkedin.com/cws/share?url=' + url, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + winWidth + ',height=' + winHeight);
    }

    return false;
}

function imageheight_product() {
    if ($(window).width() < 768) {
        $(".product-list ul li.selected .product-list__item-expander .leftside").css({
            height: $(".product-list ul li.selected .product-list__item-expander .leftside").outerWidth() + "px"
        });

        $(".product-list .product-list__item-expander .swiper-container").css({
            height: $(".product-list .product-list__item-expander .swiper-container").outerWidth() + "px"
        });
    }
}

$("body,html").on("change","input[type=file]", function(){
    var fullPath = document.querySelector('input[type=file]').value;
    if (fullPath) {
        var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
        var filename = fullPath.substring(startIndex);
        if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
            filename = filename.substring(1);
        }
        $(this).parent().children("input[type=text]").text = filename;
        $(this).parent().children("input[type=text]").val(filename);
    }
});

$("body,html").on("click",".watch-gallery", function(event){
    event.preventDefault();
    var galeria = $(this).data('galeria');
    $("#"+galeria).addClass("active");
});

$("body,html").on("click",".light-window-contact .light-window__close", function(event){
    event.preventDefault();
    $(".light-window-contact").removeClass("active");
});

$(window).on("scroll", function() {
	var scrollHeight = $(document).height();
	var scrollPosition = $(window).height() + 100 + $(window).scrollTop();

	//console.log((scrollHeight - scrollPosition) / scrollHeight)


	if ((scrollHeight - scrollPosition) / scrollHeight < 0) {
	    $(".rodape.float").addClass("unfix");
	}else{
		$(".rodape.float").removeClass("unfix");
	}

    let cookiePopUp = getCookiePopUp("cookiePopUp");
    if(cookiePopUp == "") {
        $(".sample-modal-newsletter").addClass("active");
        setCookiePopUp("cookiePopUp", 1, 2); 
    }
});


function setCookiePopUp(cname, cvalue, exhours) {
    const d = new Date();
    d.setTime(d.getTime() + (exhours * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
function getCookiePopUp(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function moveSlide(sliderId, direction) {
    let slider = document.getElementById(sliderId);
    let slides = slider.getElementsByClassName('slide-elastron');
    let currentIndex = parseInt(slider.dataset.index || 0);
    
    currentIndex = (currentIndex + direction + slides.length) % slides.length;
    slider.dataset.index = currentIndex;
    
    let offset = -currentIndex * 100;
    slider.style.transform = `translateX(${offset}%)`;
}

function setMagnifier() {
    
    $(".image-container").each(function () {
        var container = $(this);
        var img = container.find(".small-image");
        var magnifier = container.find(".magnifier");
        var largeImgSrc = container.attr("data-large");
        var zoomLevel = parseFloat(container.attr("data-zoom")) || 2;
        var mouseX = 0, mouseY = 0, isHovering = false;

        magnifier.css({
            "background-image": "url(" + largeImgSrc + ")",
            "background-size": (img.width() * zoomLevel) + "px " + (img.height() * zoomLevel) + "px"
        });

        function updateMagnifier() {
            if (!isHovering) return;

            var offset = container.offset();
            var imgWidth = img.width();
            var imgHeight = img.height();
            var magWidth = magnifier.width();
            var magHeight = magnifier.height();

            var bgSizeX = imgWidth * zoomLevel;
            var bgSizeY = imgHeight * zoomLevel;

            var posX = mouseX - offset.left - magWidth / 2;
            var posY = mouseY - offset.top - magHeight / 2;

            var bgPosX = -(mouseX - offset.left) * zoomLevel + magWidth / 2;
            var bgPosY = -(mouseY - offset.top) * zoomLevel + magHeight / 2;

            magnifier.css({
                left: posX + "px",
                top: posY + "px",
                backgroundPosition: bgPosX + "px " + bgPosY + "px",
                backgroundSize: bgSizeX + "px " + bgSizeY + "px"
            }).fadeIn(100);
        }

        container.on("mousemove", function (e) {
            mouseX = e.pageX;
            mouseY = e.pageY;
            isHovering = true;
            updateMagnifier();
        });

        container.on("mouseleave", function () {
            magnifier.fadeOut(100);
            isHovering = false;
        });

        container.on("wheel", function (e) {
            e.preventDefault();
            if (e.originalEvent.deltaY < 0) {
                zoomLevel = Math.min(zoomLevel + 0.2, 6);
            } else {
                zoomLevel = Math.max(zoomLevel - 0.2, 1.5);
            }
            container.attr("data-zoom", zoomLevel.toFixed(1));

            // **Force background size update**
            magnifier.css("background-size", (img.width() * zoomLevel) + "px " + (img.height() * zoomLevel) + "px");

            updateMagnifier(); // Immediately refresh zoom level
        });
    });
};