console.log(" Script loaded!");

const registerForm = document.getElementById("Form");
console.log("registerForm element:", registerForm);

if (!registerForm) {
  console.error("Form with id='Form' NOT FOUND!");
}

registerForm.addEventListener("submit", async (event) => {
  console.log("Submit event triggered!");
  event.preventDefault();

  // Read form data
  const formData = new FormData(event.target);
  const userData = Object.fromEntries(formData);
  console.log(" Extracted userData:", userData);

  try {
    console.log("Sending LOGIN request to /auth/sign_in");
    console.log("Payload:", JSON.stringify(userData));

    const response = await fetch("https://api.everrest.educata.dev/auth/sign_in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("Login response object:", response);
    console.log("Login response status:", response.status);

    const result = await response.json();
    console.log("🔍 Parsed login result:", result);

    // Save token
    console.log(" Saving token to sessionStorage:", result.access_token);
    sessionStorage.setItem("token", result.access_token);

    // SECOND FETCH
    try {
      console.log(" Sending request to /shop/cart/product");
      console.log(" Payload:", JSON.stringify(userData));

      const res = await fetch("https://api.everrest.educata.dev/shop/cart/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      console.log(" Cart response object:", res);
      console.log(" Cart response status:", res.status);

      const data = await res.json();
      console.log(" Parsed cart result:", data);
    } catch (cartError) {
      console.error(" Error in second fetch:", cartError);
    }

    // Redirect or show error
    if (response.ok) {
      console.log(" Login successful — redirecting to index.html");
      window.location.href = "../index.html";
    } else {
      console.warn(" Login failed:", result.message);
      alert(result.message || "რეგისტრაცია ვერ შესრულდა");
    }
  } catch (error) {
    console.error(" Login error:", error);
  }
});

