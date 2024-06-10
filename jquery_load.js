jQuery(function() {
    // 初期ロード
    jQuery("#content").load("contents/profile.html");
    jQuery("#init_content").addClass('active');
    // リンククリック時の動作を定義
    jQuery("nav a").on("click", function(e) {
        e.preventDefault(); // デフォルトのリンク動作を無効化
        var target = jQuery(this).attr("href");
        var newContentUrl;

        if (target === "profile") {
            newContentUrl = "contents/profile.html";
        } else if (target === "works") {
            newContentUrl = "contents/works.html";
        } else if (target === "contact") {
            newContentUrl = "contents/contact.html";
        }

        // 同じリンクを連続してクリックした場合は何もしない
        if (jQuery(this).hasClass('active')) {
            return;
        }

        jQuery('#content').addClass('slide-out-right');

        setTimeout(function(){
            jQuery('#content').removeClass('slide-out-right').empty();
            jQuery("#content").load(newContentUrl, function(){
                $("#content").addClass("fade-in");
            });}, 250);
        $("#content").on("animationend", function() {
            $(this).removeClass("fade-in");
        });
        jQuery("nav a").removeClass('active');
        jQuery(this).addClass('active');
    });
});
