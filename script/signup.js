const registerForm = document.getElementById("Form");

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const userData = Object.fromEntries(formData);

  console.log("ფორმის ინფორმაცია", userData);

  try {
    console.log("ვაგზავნით რეგისტრაციის მოთხოვნას /auth/sign_up");
    const response = await fetch("https://api.everrest.educata.dev/auth/sign_up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    console.log("ობიექტი:", response);
    console.log("სტატუსი:", response.status);

    const result = await response.json();
    console.log("რეზულტატი", result);

    if (result._id) {
      localStorage.setItem("userId", result._id);
      console.log(" _id დავამახსოვრეთ localStorage:", result._id);

       window.location.href = "../pages/signin.html"; //===========================
    } else {
      console.log(" _id ვერ მოიძებნა რეზულტატში");
    }
  } catch (error) {
    console.log("Fetch error:", error);
  }
});

// <!--==========================================-->
// <!--Margus Lillemägi | codepen.io/VisualAngle/-->
// <!--==========================================-->
document.addEventListener("DOMContentLoaded", function (event) {
  window.onload = function () {
    // array with text to type
    var dataText = [
      "Hello, here is some text typing along a spiral path. here is some text typing along a spiral path. Hello, here is some text typing along a spiral path. Hello, here is some text typing along a spiral path. here is some text typing along...",
    ];
    //text input caret
    var caret = "\u258B";

    // type a text
    // keep calling itself until the text is finished
    function type(text, i, fnCallback) {
      // chekc if text isn't finished yet
      if (i < text.length) {
        // add next character to text + caret
        document.querySelector("#text").textContent = text.substring(0, i + 1) + caret;

        // delay and call this function again for next character
        setTimeout(function () {
          type(text, i + 1, fnCallback);
        }, 250);
      }
      // text finished, call callback if there is a callback function
      else if (typeof fnCallback == "function") {
        // call callback after timeout
        setTimeout(fnCallback, 1500);
      }
    }
    // start animation for a text in the dataText array
    function StartAnimation(i) {
      if (typeof dataText[i] == "undefined") {
        setTimeout(function () {
          StartAnimation(0);
        }, 1000);
      }
      // check if dataText[i] exists
      if (i < dataText[i].length) {
        // text exists! start typewriter animation
        type(dataText[i], 0, function () {
          // after callback (and whole text has been animated), start next text
          StartAnimation(i + 1);
        });
      }
    }
    // start the text animation
    StartAnimation(0);
  };
});



