(function($){
    $(document).on('click touchstart', '.acb-tabs-block .acb-tabs-block-head > .acb-tabs-block-tab', function(event){
        if( $(this).hasClass('active') ) return false;
        var index = $(this).index();
        var block = $(this).parent().parent();
        block.find('.active').removeClass('active');

        block.find('.acb-tabs-block-content:eq(' + index + '), .acb-tabs-block-tab:eq(' + index + ')').addClass('active');
    });
})(jQuery);