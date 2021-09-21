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

  // - Custom Font
  if (localStorage.getItem("font") != null) {
    $("#font").text(localStorage.getItem("font"));
    updateFont();


    const fontCheck = new Set([
      // Windows 10
      'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
      // macOS
      'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
      // Font Familiy
      'Times', 'Times New Roman', 'Georgia', 'serif', 'Verdana', 'Arial', 'Helvetica', 'sans-serif', 'cursive', 'fantasy', 'emoji', 'math', 'fangsong'
    ].sort());

    (async() => {
      await document.fonts.ready;

      // const fontAvailable = new Set();

      for (const font of fontCheck.values()) {
        if (document.fonts.check(`12px "${font}"`)) {
          // fontAvailable.add(font);
          $("#fontlist").append( $(`<option value="${font}">${font}</option>`) );
        }
      }

      // console.log('Available Fonts:', [...fontAvailable.values()]);

      $(`#fontlist option[value="${localStorage.getItem("font")}"]`).attr("selected", "true");
    })();
  }

  // - Theme Color
  if (localStorage.getItem("themecolor") != null) {
    $("#themecolor").val( localStorage.getItem("themecolor") );
    updateThemeColor();
  }

  $("#themecolor").parents(".dropdown").on("click", function() {
    if ($(this).attr("closed") == "false") {
      // $("#themecolor").focus();
      // $("#trackdisplay").focus();
      // $("#trackdisplay").blur();
    }
  })
  $("#themecolor").on("change", function() {
    
    updateThemeColor($(this).val());
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
  });
  $("#fontlist").on("input", function() {
    localStorage.setItem("font", $(this).val());
    updateFont();
    $("#font").text(localStorage.getItem("font"));
  });

  $("#twitter").on("input", function() {
    localStorage.setItem("twitter", $(this).val());
  });
  $("#facebook").on("input", function() {
    localStorage.setItem("facebook", $(this).val());
  });
  $("#tumblr").on("input", function() {
    localStorage.setItem("tumblr", $(this).val());
  });

  $("#email_subject").on("input", function() {
    let data = JSON.parse(localStorage.getItem("email"));
    // console.log($(this).val());
    data["subject"] = $(this).val();
    localStorage.setItem("email", JSON.stringify(data));
  });
  $("#email_body").on("input", function() {
    let data = JSON.parse(localStorage.getItem("email"));
    // console.log($(this).val());
    data["body"] = $(this).val();
    localStorage.setItem("email", JSON.stringify(data));
  });

  $("#copy").on("input", function() {
    localStorage.setItem("copy", $(this).val());
  });



  // Links
  $("#discord").on("click", () => {
    openURL("https://discord.gg/R9R6fdm");
  });
  $("#github").on("click", () => {
    openURL("https://github.com/S4WA/soundcloud-player");
  });
  $("#contact-twitter").on("click", () => {
    openURL("https://twitter.com/evildaimyoh");
  });
});