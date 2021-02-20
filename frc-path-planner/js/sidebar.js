var oriVal;
$("#pathlist").on('dblclick', '#pathname', function () {
    oriVal = $(this).text();
    $(this).text("");
    $("<input type='text' maxlength='10' class='input' id='inputbox'>").appendTo(this).focus();
});

$("#pathlist").on('dblclick', '#pathspeed', function () {
    oriVal = $(this).text();
    $(this).text("");
    $("<input type='text' maxlength='4' class='input' id='speedbox'>").appendTo(this).focus();
    $('#speedbox').keyup(function () {
        if ($(this).val() > 1) {
            $(this).val('1');
        }
    });

    setInputFilter(document.getElementById("speedbox"), function (value) {
        return /^-?\d*[.,]?\d*$/.test(value);
    });
});

$(function () {
    $('#widthbox').keyup(function () {
        if ($(this).val() > 20) {
            $(this).val('1');
        }
    });
    setInputFilter(document.getElementById("widthbox"), function (value) {
        return /^-?\d*[.,]?\d*$/.test(value);
    });
});


$("#pathlist").on('focusout', 'p > input', function () {
    var $this = $(this);
    $this.parent().text(($this.val() || oriVal));
    $this.remove(); // Don't just hide, remove the element.
});

$("#pathlist").on('focusout', 'h3 > input', function () {
    var $this = $(this);
    $this.parent().text(($this.val() || oriVal));    
    $this.remove(); // Don't just hide, remove the element.
});

function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
        textbox.addEventListener(event, function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    });
}