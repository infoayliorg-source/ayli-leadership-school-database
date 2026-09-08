// AYLI Student Authentication

document
    .getElementById("studentLoginForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const ayliId =
            document.getElementById("ayliId").value
                .trim()
                .toUpperCase();

        const password =
            document.getElementById("studentPassword").value;

        const message =
            document.getElementById("studentLoginMessage");

        // Get AYLI students from the database
        const students =
            JSON.parse(
                localStorage.getItem("ayliStudents") || "[]"
            );

        // Find student
        const student =
            students.find(function(s) {

                return s.ayliId === ayliId;

            });

        // Check student and password

if (student && password === student.password) {

            localStorage.setItem(
                "ayliStudentLoggedIn",
                "true"
            );

            localStorage.setItem(
                "ayliCurrentStudentId",
                student.ayliId
            );

            window.location.href =
    "Js/student-profile.html?id=" +
    encodeURIComponent(student.ayliId);

        } else {

            message.textContent =
                "Invalid AYLI ID or password.";

            message.style.color = "red";

        }

    });