document.addEventListener("DOMContentLoaded", () => {
    // Childs
    $(".dropdown").each(function(i) {
        if ( $(this).attr("closed") != null ) {
            if ( Bool( $(this).attr("closed") ) ) {
                $(this).children(".dd-child").hide();
            } 
        } else {
            $(this).attr("closed", "true");
            $(this).children(".dd-child").hide();
        }
    })

    // Parents
    $(".dropdown .dd-parent").addClass("clickable");

    $(".dropdown .dd-parent").on("click", function() {
        let parent = $(this).parent(), value = Bool( parent.attr("closed") );

        parent.attr("closed", !value);

        if (value) {
            parent.children(".dd-child").slideDown();
        } else {
            parent.children(".dd-child").slideUp();
        }
    });



    // Elements
    $(".dropdown .dd-child textarea").attr("spellcheck", "false");
    $(".dropdown .dd-child input").attr("spellcheck", "false");



    // Settings
    // - Track Display
    if (localStorage.getItem("trackdisplay") != null) {
        $("#trackdisplay").val(localStorage.getItem("trackdisplay"));
    }

    // - Theme Color
    if (localStorage.getItem("themecolor") != null) {
        let val = localStorage.getItem("themecolor");
        
        $("#themecolor").val(val);
        
        $("#themecolor").focus();
        $("#themecolor").blur();
        
        $(":root").css("--theme-color", "#" + val);
    }
    $("#themecolor").on("change", function() {
        changeColor($(this).val());
    });

    // Share Templates
    // - init
    if (localStorage.getItem("twitter") != null) {
        $("#twitter").val( localStorage.getItem("twitter") );
    }
    if (localStorage.getItem("facebook") != null) {
        $("#facebook").val( localStorage.getItem("facebook") );
    }
    if (localStorage.getItem("tumblr") != null) {
        $("#tumblr").val( localStorage.getItem("tumblr") );
    }
    if (localStorage.getItem("email") != null) {
        let data = JSON.parse( localStorage.getItem("email") );
        $("#email_subject").val(data["subject"]);
        $("#email_body").val(data["body"]);
    }
    if (localStorage.getItem("copy") != null) {
        $("#copy").val( localStorage.getItem("copy") );
    }

    // - inputs
    $("#trackdisplay").on("input", function() {
        localStorage.setItem("trackdisplay", $(this).val());
    })

    $("#twitter").on("input", function() {
        localStorage.setItem("twitter", $(this).val());
    })
    $("#facebook").on("input", function() {
        localStorage.setItem("facebook", $(this).val());
    })
    $("#tumblr").on("input", function() {
        localStorage.setItem("tumblr", $(this).val());
    })

    $("#email_subject").on("input", function() {
        let data = JSON.parse(localStorage.getItem("email"));
        console.log($(this).val());
        data["subject"] = $(this).val();
        localStorage.setItem("email", JSON.stringify(data));
    })
    $("#email_body").on("input", function() {
        let data = JSON.parse(localStorage.getItem("email"));
        console.log($(this).val());
        data["body"] = $(this).val();
        localStorage.setItem("email", JSON.stringify(data));
    })

    $("#copy").on("input", function() {
        localStorage.setItem("copy", $(this).val());
    })



    // Links
    $("#goback").on("click", () => {
        location = "popup.html";
    });
    $("#discord").on("click", () => {
        openURL("https://discord.gg/R9R6fdm");
    });
    $("#github").on("click", () => {
        openURL("https://github.com/S4WA/soundcloud-player");
    });
});

function setThemeColor(color) {
    color = color.includes("#") ? color : "#" + color;

    localStorage.setItem("themecolor", color);
    $(":root").css("--theme-color", color);
}