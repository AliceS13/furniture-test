import $ from 'jquery';
import 'slick-carousel';

const $mainSlider = $('.js-main-slider');
const $advantagesSlider = $('.js-advantages-slider');
var $status = $('.paging-info');

$mainSlider.on('init reInit afterChange', function(event, slick, currentSlide, nextSlide){
    //currentSlide is undefined on init -- set it to 0 in this case (currentSlide is 0 based)
    var i = (currentSlide ? currentSlide : 0) + 1;
    $status.html(`<span class="curr-slide">${i < 10 ? '0' + i : 1}</span>/ <span>${slick.slideCount < 10 ? '0' + slick.slideCount : slick.slideCount }</span>`);
});

$mainSlider.slick({
    dots: false,
    slidesToShow: 1,
    infinite: false,
    appendArrows: ".main__arrows"
});

$advantagesSlider.slick({
    dots: false,
    slidesToShow: 3,
    infinite: false,
    responsive: [
        {
          breakpoint: 1300,
          settings: {
            slidesToShow: 2,
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
          }
        },
    ]
});

