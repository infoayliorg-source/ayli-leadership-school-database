// ==========================================
// AYLI STUDENT GRADE REPORT
// ==========================================

const REPORT_SUPABASE_URL =
    "https://jutxahzlecbbphgxlouy.supabase.co";

const REPORT_SUPABASE_KEY =
    "sb_publishable_3e7SrhjXjF6haRM7yWIv3A_XRj-nlYk";

const reportSupabaseClient =
    window.supabase.createClient(
        REPORT_SUPABASE_URL,
        REPORT_SUPABASE_KEY
    );


// ==========================================
// LOAD GRADE REPORT
// ==========================================

document.addEventListener("DOMContentLoaded", async function () {

    const studentLoggedIn =
        localStorage.getItem("ayliStudentLoggedIn");

    const ayliId =
        localStorage.getItem("ayliCurrentStudentId");


    // Make sure student is logged in
    if (!studentLoggedIn || !ayliId) {

        window.location.href = "student-login.html";

        return;
    }


    try {

        // ==========================================
        // GET STUDENT INFORMATION
        // ==========================================

        const {
            data: student,
            error: studentError
        } = await reportSupabaseClient
            .from("students")
            .select("*")
            .eq("ayli_id", ayliId)
            .single();


        if (studentError) {
            console.error(
                "Student loading error:",
                studentError
            );

            alert("Unable to load student information.");

            return;
        }


        // ==========================================
        // DISPLAY STUDENT INFORMATION
        // ==========================================

       const fullName = [
    student.first_name,
    student.middle_name,
    student.last_name
]
    .filter(name =>
        name &&
        name.trim() !== "" &&
        name.toUpperCase() !== "EMPTY"
    )
    .join(" ");

document.getElementById("studentName").textContent =
    fullName || "-";

        document.getElementById("studentId").textContent =
            student.ayli_id || "-";

        document.getElementById("studentCohort").textContent =
            student.cohort || "-";

        document.getElementById("studentChapter").textContent =
            student.chapter || "-";


        // ==========================================
        // GET ACADEMIC RECORDS
        // ==========================================

        const {
            data: records,
            error: recordsError
        } = await reportSupabaseClient
            .from("academic_records")
            .select("*")
            .eq("ayli_id", ayliId);


        if (recordsError) {

            console.error(
                "Academic records error:",
                recordsError
            );

            document.getElementById(
                "gradeReportBody"
            ).innerHTML = `
                <tr>
                    <td colspan="6">
                        Unable to load academic records.
                    </td>
                </tr>
            `;

            return;
        }


        // ==========================================
        // CHECK RECORDS
        // ==========================================

        if (!records || records.length === 0) {

            document.getElementById(
                "gradeReportBody"
            ).innerHTML = `
                <tr>
                    <td colspan="6">
                        No academic records found.
                    </td>
                </tr>
            `;

            document.getElementById(
                "totalCourses"
            ).textContent = "0";

            document.getElementById(
                "averageScore"
            ).textContent = "0.0";

            document.getElementById(
                "highestGrade"
            ).textContent = "-";

            document.getElementById(
                "overallStatus"
            ).textContent = "No Records";

            return;
        }


        // ==========================================
        // DISPLAY COURSES
        // ==========================================

        const tableBody =
            document.getElementById("gradeReportBody");

        tableBody.innerHTML = "";


        let totalScore = 0;

        let validScores = 0;

        let highestGrade = "-";

        let allPassed = true;


        records.forEach(function (record, index) {

            const row =
                document.createElement("tr");


            const score =
                Number(record.score);


            if (!isNaN(score)) {

                totalScore += score;

                validScores++;

            }


            const grade =
                record.grade || "-";


            const result =
                record.result || "-";


            // Determine highest grade
            const gradeOrder = {
                "A": 5,
                "B": 4,
                "C": 3,
                "D": 2,
                "F": 1
            };


            if (
                highestGrade === "-" ||
                (gradeOrder[grade] || 0) >
                (gradeOrder[highestGrade] || 0)
            ) {

                highestGrade = grade;

            }


            // Determine overall pass status
            if (
                result.toLowerCase() === "fail" ||
                grade.toUpperCase() === "F"
            ) {

                allPassed = false;

            }


            row.innerHTML = `

                <td>${index + 1}</td>

                <td>
                    ${record.course || "-"}
                </td>

                <td>
                    ${record.lecturer || "-"}
                </td>

                <td>
                    ${record.score ?? "-"}
                </td>

                <td>
                    ${grade}
                </td>

                <td>
                    ${result}
                </td>

            `;


            tableBody.appendChild(row);

        });


        // ==========================================
        // CALCULATE SUMMARY
        // ==========================================

        const averageScore =
            validScores > 0
                ? totalScore / validScores
                : 0;


        document.getElementById(
            "totalCourses"
        ).textContent = records.length;


        document.getElementById(
            "averageScore"
        ).textContent =
            averageScore.toFixed(1);


        document.getElementById(
            "highestGrade"
        ).textContent =
            highestGrade;


        document.getElementById(
            "overallStatus"
        ).textContent =
            allPassed ? "Passed" : "Needs Improvement";


    } catch (error) {

        console.error(
            "Grade report error:",
            error
        );

        alert(
            "An error occurred while loading your grade report."
        );

    }

});