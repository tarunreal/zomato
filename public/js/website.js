var eventToUse = 'tap';
$(document).ready(function() {
    makeTemplates();

    $('.widgetNew').mouseenter(function(){
        $(this).css('width','13rem');
        $(this).find('.text').removeClass('hide');

    })
    $('.widgetNew').mouseleave(function(){
        $(this).css('width','4rem');
        $(this).find('.text').addClass('hide');
    })

    bind('.btnClaim', function(){
      $('.signUpContainer').css('display','block');
      bind('.crossIcon', function(){
        $('.signUpContainer').css('display','none');

      })
    });

    var pathname = window.location.pathname;
    pathname = pathname.slice(1, -1) + 'e';
    restaurant.getData({}, 'POST', pathname, function(a) {
        $('.loaderContainer').css('visibility', 'collapse')
        $('.mainContainer').css('overflow', 'visible')
        console.log(a);
        if (a.data.fb && a.data.zomato) {
            renderFbZomatoData(a.data)
        } else if (a.data.zomato) {
            renderZomatoData(a.data)
        } else if (a.data.fb) {
            renderFbData(a.data)
        } else {
            //no data recieved
        }
        loadFbApi(a.data.fb.picture.data.url)
    })
    $('.restaurantNameBlock').css('float', 'left')
    bind('.btnReadMore', function() {
        $('.aboutDescription').css('height', 'auto')
        $('.aboutDescription').css('max-height', '40rem')
        $('.btnReadMore').css('visibility', 'hidden')

        $('.aboutDescription').css('overflow', 'visible')
    })
    bind('.carousalOverlay', function() {
        $(".greetingPage").css("visibility", "visible")
        $(".greetingPage").hide()
        $(".greetingPage").fadeIn(500)
        bind(".carousalOverlay", function() {
            $(".greetingPage").fadeOut(500)
            setTimeout(function() {
                $(".greetingPage").css("visibility", "hidden")
            }, 500)
        })
    })
    // $(document).on("scroll", onScroll);
    // loadTwitterApi()
    // scrollByMenu()
});

function renderFbZomatoData(r) {
    render(".restaurantName", "restaurantName", {
        name: r.fb.name
    });
    render(".headingName", "restaurantName", {
        name: r.fb.name
    });
    if (r.fb.description)
        render(".aboutDescription", "restaurantName", {
            name: r.fb.description
        });
    else
        render(".aboutDescription", "restaurantName", {
            name: r.fb.about
        });
    if ($('.aboutDescription').height() < 70) {
        $('.btnReadMore').css('visibility', 'hidden')
    }
    if (r.fb.hours) {

    } else {


    }
    r.fb.photos = {
        data: []
    }
    var count = 0
    if ((r.fb.albums.data[0] && r.fb.albums.data[1] && r.fb.albums.data[0].photos.data.length + r.fb.albums.data[1].photos.data.length > 9) || (r.fb.albums.data[0] && r.fb.albums.data[0].photos.data.length > 9)) {
        var j = 0
        var k = 0
        for (var i = 0; i < 9; i++) {
            if (r.fb.albums.data[0] && r.fb.albums.data[0].photos.data.length > j) {
              r.fb.albums.data[0].photos.data[j].count = count
                r.fb.photos.data.push(r.fb.albums.data[0].photos.data[j])
                count++
                j++
            } else if (r.fb.albums.data[1] && r.fb.albums.data[1].photos.data.length > k) {
              r.fb.albums.data[1].photos.data[j].count = count
                r.fb.photos.data.push(r.fb.albums.data[1].photos.data[j])
                count++
                k++
            }
        }
    } else {
        r.fb.photos.data.push({
            images: [{
                source: r.zomato.restaurant.featured_image,
                count: count
            }]
        })
        count++
        r.fb.photos.data.push({
            images: [{
                source: r.zomato.restaurant.thumb,
                count: count
            }]
        })
    }
    console.log(r);
    render(".imageContainer", "image", r.fb.photos.data);
    renderReviews(r.zomato.reviews)
    r.zomato.address = ''
    r.zomato.street = ''
    r.fb.address = ''
    if (r.zomato.restaurant.location) {
        if (r.zomato.restaurant.location.address) {
            r.zomato.street += r.zomato.restaurant.location.address
        }
        if (r.fb.location && r.fb.location.country) {
            r.fb.address += r.fb.location.country
        }
        if (r.fb.location && r.fb.location.zip) {
            if (r.fb.address != '')
                r.fb.address += ','
            r.fb.address += r.fb.location.zip
        }
        console.log(r.fb);
        render(".addressBlock", "address", {
            address: r.fb.address,
            street: r.zomato.street
        })
        var mapUrl = ''
        if( r.zomato.restaurant.location.latitude<1&&r.fb.location&&r.fb.location.latitude){
          mapUrl = "https://maps.google.com/maps?q=" + r.fb.location.latitude + "," + r.fb.location.longitude + "&hl=es;z=14&amp;output=embed";
        }else{
        mapUrl = "https://maps.google.com/maps?q=" + r.zomato.restaurant.location.latitude + "," + r.zomato.restaurant.location.longitude + "&hl=es;z=14&amp;output=embed";
      }
      render(".mapPage", "map", {
            src: mapUrl
        })
    }
    if (r.fb.phone)
        render(".contactBlock", "contact", {
            phone: r.fb.phone
        })
    if (r.fb.events)
        renderEvents(r.fb.events.data)
}

function renderZomatoData(r) {
    render(".restaurantName", "restaurantName", {
        name: r.fb.name
    });
    render(".headingName", "restaurantName", {
        name: r.fb.name
    });
    //location zommato
    renderReviews(r.zomato.reviews)
    var mapUrl = "https://maps.google.com/maps?q=" + r.zomato.restaurant.location.latitude + "," + r.zomato.restaurant.location.longitude + "&hl=es;z=14&amp;output=embed"
    render(".mapPage", "map", {
        src: mapUrl
    })
}

function renderFbData(r) {
    render(".restaurantName", "restaurantName", {
        name: r.fb.name
    });
    render(".headingName", "restaurantName", {
        name: r.fb.name
    });
    if (r.fb.description)
        render(".aboutDescription", "restaurantName", {
            name: r.fb.description
        });
    else
        render(".aboutDescription", "restaurantName", {
            name: r.fb.about
        });
    r.fb.photos = {
        data: []
    }
    var count = 0
    if ((r.fb.albums.data[0] && r.fb.albums.data[1] && r.fb.albums.data[0].photos.data.length + r.fb.albums.data[1].photos.data.length > 9) || (r.fb.albums.data[0] && r.fb.albums.data[0].photos.data.length > 9)) {
        var j = 0
        var k = 0
        for (var i = 0; i < 9; i++) {
            if (r.fb.albums.data[0] && r.fb.albums.data[0].photos.data.length > j) {
              r.fb.albums.data[0].photos.data[j].count = count
                r.fb.photos.data.push(r.fb.albums.data[0].photos.data[j])
                count++
                j++
            } else if (r.fb.albums.data[1] && r.fb.albums.data[1].photos.data.length > k) {
              r.fb.albums.data[1].photos.data[j].count = count
                r.fb.photos.data.push(r.fb.albums.data[1].photos.data[j])
                count++
                k++
            }
        }
    } else {
        r.fb.photos.data.push({
            images: [{
                source: r.zomato.restaurant.featured_image,
                count: count
            }]
        })
        count++
        r.fb.photos.data.push({
            images: [{
                source: r.zomato.restaurant.thumb,
                count: count
            }]
        })
    }
    render(".imageContainer", "image", r.fb.photos.data);
    if (r.fb.events)
        renderEvents(r.fb.events.data)
    r.fb.address = ''
    r.fb.street = ''
    if (r.fb.location) {
        if (r.fb.location.street) {
            r.fb.street += r.fb.location.street
        }
        if (r.fb.location.city) {
            r.fb.address += r.fb.location.city
        }
        if (r.fb.location.country) {
            if (r.fb.address != '')
                r.fb.address += ','
            r.fb.address += r.fb.location.country
        }
        if (r.fb.location.zip) {
            if (r.fb.address != '')
                r.fb.address += ','
            r.fb.address += r.fb.location.zip
        }
        console.log(r.fb);
        render(".addressBlock", "address", {
            address: r.fb.address,
            street: r.fb.street
        })
        if (r.fb.location.latitude) {
            var mapUrl = "https://maps.google.com/maps?q=" + r.fb.location.latitude + "," + r.fb.location.longitude + "&hl=es;z=14&amp;output=embed";
            render(".mapPage", "map", {
                src: mapUrl
            })
        }
    }
    if (r.fb.phone)
        render(".contactBlock", "contact", {
            phone: r.fb.phone
        })
}

function renderReviews(data) {
    if (data.user_reviews) {
        var i = 0;
        for (var r of data.user_reviews) {
            if (i == 0)
                r.first = 1
            i++
            r.image = r.review.user.profile_image
            r.review_text = r.review.review_text
            r.user = r.review.user.name
        }
        render(".carousalContainer", "review", data);
        bind('.btnViewMore', function() {
            $('.carousalOverlay').css('display', 'block');
            $('.mainContainer').css('overflow-y', 'hidden');
            $(".carousalContainer").get(0).scrollIntoView();
            $('.reviewContainerBlock').scrollTop()
            render('.reviewContainerBlock', 'allReviews', data.user_reviews)
            $('.reviewContainer').addClass('slideUp');
            bind('.carousalOverlay', function() {
                $('.mainContainer').css('overflow-y', 'visible');
                $('.carousalOverlay').css('display', 'none');
                $(".carousalContainer").get(0).scrollIntoView();
                $('.reviewContainer').removeClass('slideUp');
            })
        });
    }
}

function renderEvents(events) {
    var obj = {
        data: []
    }
    for (var i = 0; i < events.length; i++) {
        if (events[i].cover)
            events[i].image = events[i].cover.source
        events[i].address = ''
        if (events[i].place.location) {
            if (events[i].place.location.street) {
                events[i].address += events[i].place.location.street
            }
            if (events[i].place.location.city) {
                if (events[i].address != '')
                    events[i].address += ','
                events[i].addresss += events[i].place.location.city
            }
            if (events[i].place.location.country) {
                if (events[i].address != '')
                    events[i].address += ','
                events[i].address += events[i].place.location.country
            }
            if (events[i].place.location.zip) {
                if (events[i].address != '')
                    events[i].address += ','
                events[i].address += events[i].place.location.zip
            }
        }
        events[i].start_time = new Date(events[i].start_time);
        events[i].start_time = events[i].start_time.getDate() + ' ' + month[parseInt(events[i].start_time.getMonth())] + ' ' + events[i].start_time.getFullYear();
        obj.data.push(events[i])
        if (i == events.length - 1) {
            console.log(obj);
            render('.eventPage', 'event', obj)
            bind('.btnBookEvent', showConfirmationContainer);
        }
    }
}

function showConfirmationContainer() {
    $('.confirmationContainer').addClass('slideConfirmationScreen');
    $('.carousalOverlay').css('display', 'block');
    $('.mainContainer').css('overflow-y', 'hidden');
    $(".eventContainer").get(0).scrollIntoView();

    bind('.numberBlock', function showSelectedNumber() {
      $('.numberBlock').removeClass('selectedNumber');
      $(this).addClass('selectedNumber');
    });

    bind('.btnConfirm', showThankYouContainer)
    bind('.carousalOverlay', function(){
      $('.confirmationContainer').removeClass('slideConfirmationScreen');
      $('.mainContainer').css('overflow-y', 'visible');
      $('.carousalOverlay').css('display', 'none');
    })
}

function showThankYouContainer() {
  console.log("jkgkjgvkjb");
  name = $('.placeholder.name').val();
  number = $('.placeholder.number').val();
    if (name != '' && number != '') {
        $('.thankYouContainer .name').text(name);
        $('.thankYouContainer').addClass('fadeIn');
        $('.target').text('');
        setTimeout(function() {
            $('.confirmationContainer').removeClass('slideConfirmationScreen');
            $('.thankYouContainer').removeClass('fadeIn');
            $('.mainContainer').css('overflow-y', 'visible');
            $('.carousalOverlay').css('display', 'none');
            $(".carousalContainer").get(0).scrollIntoView();
            $('.placeholder').val('');
        }, 1500);
    } else {
        $('.target').text('*Please fill in the all input fields');
    }
}

function loadFbApi(image) {
    window.fbAsyncInit = function() {
        FB.init({
            appId: '1001533829900641',
            status: true,
            cookie: true,
            xfbml: true
        });
    };
    (function() {
        var e = document.createElement('script');
        e.async = true;
        e.src = document.location.protocol +
            '//connect.facebook.net/en_US/all.js';
        document.getElementById('fb-root').appendChild(e);
    }());
    bind('.facebookBtn', function() {
        var url = window.location.href;
        console.log(image);
        FB.ui({
            method: 'feed',
            name: 'My Custom Website',
            link: url,
            picture: image,
            caption: '',
            description: "Create Your own custom website : " + url,
            message: ''
        });
    })
}

function loadTwitterApi() {
    ! function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
            p = /^http:/.test(d.location) ? 'http' : 'https';
        if (!d.getElementById(id)) {
            js = d.createElement(s);
            js.id = id;
            js.src = p + '://platform.twitter.com/widgets.js';
            fjs.parentNode.insertBefore(js, fjs);
        }
    }(document, 'script', 'twitter-wjs');
}


function onScroll(event) {
    var scrollPos = $(document).scrollTop();
    $('.option').each(function() {
        var currLink = $(this);
        var refElement = $(currLink.attr("data-link"));
        console.log(refElement.position().top)
        if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
            $('.option').removeClass("activeNav");
            currLink.addClass("activeNav");
        } else {
            currLink.removeClass("activeNav");
        }
    });
}

function scrollByMenu() {
    $('.option').on('click', function(e) {
        e.preventDefault();
        $(document).off("scroll");
        $('.navTabContainer').removeClass('showNavOption');
        if ($('.navbarHeader').width() > 500) {
            $('.option').each(function() {
                $(this).removeClass('activeNav');
            })
            $(this).addClass('activeNav');
        }


        var target = $(this).attr('data-link'),

            menu = target;
        $target = $(target);
        $('html, body').stop().animate({
            'scrollTop': $target.offset().top + 2
        }, 500, 'swing', function() {
            window.location.hash = target;
            $(document).on("scroll", onScroll);
        });
    });
}
