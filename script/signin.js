const registerForm = document.getElementById("Form");
console.log("რეგისტრაციის ფორმა:", registerForm);

if (!registerForm) {
  console.error("ფორმა id='Form' ვერ იპოვა");
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const userData = Object.fromEntries(formData); //  email, password 
  console.log("Form submitted with:", userData);

  try {
    // 1. Sign in
    console.log("login request sent...");
    const response = await fetch("https://api.everrest.educata.dev/auth/sign_in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    console.log("Sign-in ობიექტი:", response);
    console.log("Sign-in სტატუსი:", response.status);

    const result = await response.json();
    console.log("Sign-in რეზულტატი JSON:", result);

    if (!response.ok) {
      console.warn("Login failed:", result.error || "უცნობი შეცდომა");

      // შემოწმება email არსებობს თუ არა
      const accessToken = localStorage.getItem("token"); 
      let foundUser = false;
      const pageSize = 50;
      let pageIndex = 1;

      while (!foundUser) {
        const resUsers = await fetch(
          `https://api.everrest.educata.dev/auth/all?page_index=${pageIndex}&page_size=${pageSize}`,
          {
            headers: {
              Authorization: accessToken ? `Bearer ${accessToken}` : "",
              "Content-Type": "application/json",
            },
          }
        );

        const dataUsers = await resUsers.json();
        if (!dataUsers.users || dataUsers.users.length === 0) break;

        foundUser = dataUsers.users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());

        if (foundUser) break;
        if (dataUsers.users.length < pageSize) break;

        pageIndex++;
      }

      if (!foundUser) {
        showTemporaryModal("Email შეცდომითაა შეყვანილი / ან არაა შექმნილი");
      } else {
        showTemporaryModal("არასწორი პაროლი");
      }

      return; 
    }

    //  ტოკენის შენახვა localStorage-ში
    localStorage.setItem("token", result.access_token);
    localStorage.setItem("refresh_token", result.refresh_token);
    console.log("Tokens saved in localStorage:", {
      token: result.access_token,
      refresh_token: result.refresh_token,
    });

    // იუზერის მოძებნა /auth/all endpoint-ით
    const accessToken = result.access_token;
    const pageSize = 50;// იუზერი წამოვიღოთ ერთ პეიჯზე
    let pageIndex = 1; // დაწყება პირველი გვერდიდან
    let foundUser = null;

    console.log("Searching for user in /auth/all pages...");

    while (!foundUser) {
      console.log(`Fetching page ${pageIndex}...`);
      const res = await fetch(
        `https://api.everrest.educata.dev/auth/all?page_index=${pageIndex}&page_size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      console.log(`გვერდი ${pageIndex} data:`, data);

      if (!data.users || data.users.length === 0) {
        console.warn("არ მოიძებნა მომხმარებელი ამ გვერდზე.");
        break;
      }

      foundUser = data.users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
      console.log("იძებნება მომხმარებელი გვერდი N:", foundUser);

      if (foundUser) {
        localStorage.setItem("userId", foundUser._id);
        console.log("UserId ვამახსოვრებთ localStorage:", foundUser._id);

        window.location.href = "../index.html";  //===========================
        break;
      }

      if (data.users.length < pageSize) {
        console.warn("ბოლო გვერდამდე მივიდა, user ვერ იპოვა.");
        break;
      }

      pageIndex++; 
    }

    if (!foundUser) {
      showTemporaryModal("ემაილი არაა დარეგისტრირებული / ან არაასწორადაა შეყვანილი");
    }

    console.log("Login process complete.");
  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred during login.");
  }
});

