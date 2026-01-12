// カスタムイージング関数を追加（慣性的な動き）
jQuery.easing.easeInOutCubic = function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
};

jQuery(function() {
    let isAnimating = false;  // アニメーション中フラグ
    
    // 初期ロード: profile.htmlを読み込み
    jQuery("#content").load("contents/profile.html");
    jQuery("#init_content").addClass('active');
    
    // スクロール位置に応じてactiveクラスを更新
    jQuery('#content-container').on('scroll', function() {
        // アニメーション中はスクロールイベントを無視
        if (isAnimating) return;
        
        const scrollTop = jQuery(this).scrollTop();
        const worksElement = document.getElementById('works');
        
        if (worksElement) {
            const worksTop = worksElement.offsetTop - 100; // 閾値
            
            if (scrollTop >= worksTop) {
                // Worksセクションに到達
                jQuery("nav a").removeClass('active');
                jQuery("nav a[href='works']").addClass('active');
            } else {
                // Profileセクション
                jQuery("nav a").removeClass('active');
                jQuery("nav a[href='profile']").addClass('active');
            }
        }
    });
    
    // リンククリック時の動作を定義
    jQuery("nav a").on("click", function(e) {
        e.preventDefault();
        var target = jQuery(this).attr("href");
        
        // activeクラスの切り替え（クリック時は即座に反映）
        jQuery("nav a").removeClass('active');
        jQuery(this).addClass('active');
        
        // アニメーション中フラグをオン
        isAnimating = true;
        
        if (target === "profile") {
            // Profileクリック: 一番上にスムーズスクロール
            jQuery('#content-container').animate({
                scrollTop: 0
            }, 800, 'easeInOutCubic', function() {
                // アニメーション完了後、フラグをオフ
                isAnimating = false;
            });
        } else if (target === "works") {
            // Worksクリック: worksセクションまでスムーズスクロール
            const worksElement = document.getElementById('works');
            if (worksElement) {
                const containerTop = jQuery('#content-container').scrollTop();
                const worksTop = worksElement.offsetTop;
                
                jQuery('#content-container').animate({
                    scrollTop: worksTop  // Journal Papersがもう少し上に来るように調整
                }, 800, 'easeInOutCubic', function() {
                    // アニメーション完了後、フラグをオフ
                    isAnimating = false;
                });
            }
        }
    });
});
