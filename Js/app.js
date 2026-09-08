// ==========================================================
// AYLI STUDENT MANAGEMENT SYSTEM
// SUPABASE DATABASE VERSION
// ==========================================================

let editingStudentId = null;


// ==========================================================
// CHECK SUPABASE
// ==========================================================

function checkSupabase() {

    if (typeof supabaseClient === "undefined") {

        console.error(
            "Supabase client is not available."
        );

        return false;
    }

    return true;
}


// ==========================================================
// GET STUDENTS FROM SUPABASE
// ==========================================================

async function getStudents() {

    if (!checkSupabase()) {
        return [];
    }

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("students")
            .select("*")
            .order("id", {
                ascending: true
            });


        if (error) {

            console.error(
                "Unable to load students:",
                error
            );

            return [];
        }


        return data || [];

    } catch (error) {

        console.error(
            "Unexpected error loading students:",
            error
        );

        return [];
    }
}


// ==========================================================
// GET FORM VALUE
// ==========================================================

function getFieldValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value.trim();
}


// ==========================================================
// GENERATE AYLI STUDENT ID
// ==========================================================

async function generateStudentID(cohort) {

    const cohortText =
        String(cohort || "").trim();


    const cohortNumber =
        cohortText.replace(/\D/g, "");


    if (!cohortNumber) {
        return "AYLI-C-001";
    }


    const prefix =
        "AYLI-C" +
        cohortNumber +
        "-";


    const students =
        await getStudents();


    let highestNumber = 0;


    students.forEach(
        function(student) {

            const ayliId =
                student.ayli_id || "";


            if (
                ayliId.startsWith(prefix)
            ) {

                const number =
                    parseInt(
                        ayliId.substring(
                            prefix.length
                        ),
                        10
                    );


                if (
                    !isNaN(number) &&
                    number > highestNumber
                ) {

                    highestNumber =
                        number;
                }
            }
        }
    );


    return (
        prefix +
        String(
            highestNumber + 1
        ).padStart(3, "0")
    );
}


// ==========================================================
// REGISTER / EDIT STUDENT
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const studentForm =
            document.getElementById(
                "studentForm"
            );


        if (!studentForm) {
            return;
        }


        studentForm.addEventListener(
            "submit",
            async function(event) {

                event.preventDefault();


                if (!checkSupabase()) {

                    alert(
                        "Database connection is not available."
                    );

                    return;
                }


                const cohort =
                    getFieldValue("cohort");


                if (!cohort) {

                    alert(
                        "Please select a cohort."
                    );

                    return;
                }


                const photoInput =
                    document.getElementById(
                        "studentPhoto"
                    );


                const photoFile =
                    photoInput &&
                    photoInput.files &&
                    photoInput.files.length > 0
                        ? photoInput.files[0]
                        : null;


                // ==================================================
                // EDIT STUDENT
                // ==================================================

                if (
                    editingStudentId !== null
                ) {

                    await updateStudent(
                        studentForm,
                        photoFile
                    );

                    return;
                }


                // ==================================================
                // NEW STUDENT
                // ==================================================

                const submitButton =
                    studentForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {
                    submitButton.disabled = true;
                }


                try {

                    const ayliId =
                        await generateStudentID(
                            cohort
                        );


                    let photoUrl = "";


                    // ------------------------------------------------
                    // Read photo as data URL for now
                    // ------------------------------------------------

                    if (photoFile) {

                        photoUrl =
                            await readPhoto(
                                photoFile
                            );
                    }


                    const student = {

                        ayli_id:
                            ayliId,

                        first_name:
                            getFieldValue(
                                "firstName"
                            ),

                        middle_name:
                            getFieldValue(
                                "middleName"
                            ),

                        last_name:
                            getFieldValue(
                                "lastName"
                            ),

                        gender:
                            getFieldValue(
                                "gender"
                            ),

                        date_of_birth:
                            getFieldValue(
                                "dateOfBirth"
                            ) || null,

                        nationality:
                            getFieldValue(
                                "nationality"
                            ),

                        country:
                            getFieldValue(
                                "country"
                            ),

                        city:
                            getFieldValue(
                                "city"
                            ),

                        phone:
                            getFieldValue(
                                "phone"
                            ),

                        whatsapp:
                            getFieldValue(
                                "whatsapp"
                            ),

                        email:
                            getFieldValue(
                                "email"
                            ),

                        photo_url:
                            photoUrl,

                        cohort:
                            cohort,

                        chapter:
                            getFieldValue(
                                "chapter"
                            ),

                        status:
                            getFieldValue(
                                "status"
                            ) || "Active"
                    };


                    const {
                        data,
                        error
                    } = await supabaseClient
                        .from("students")
                        .insert([student])
                        .select()
                        .single();


                    if (error) {

                        console.error(
                            "Student registration error:",
                            error
                        );


                        alert(
                            "Unable to register student.\n\n" +
                            error.message
                        );


                        return;
                    }


                    console.log(
                        "Student registered:",
                        data
                    );


                    alert(
                        "Student registered successfully!"
                    );


                    editingStudentId =
                        null;


                    studentForm.reset();


                    await refreshSystem();


                } catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );


                    alert(
                        "An error occurred while registering the student."
                    );


                } finally {

                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                }
            }
        );
    }
);


// ==========================================================
// READ PHOTO
// ==========================================================

function readPhoto(file) {

    return new Promise(
        function(resolve, reject) {

            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    resolve(
                        event.target.result
                    );
                };


            reader.onerror =
                function(error) {

                    reject(error);
                };


            reader.readAsDataURL(file);
        }
    );
}


// ==========================================================
// UPDATE STUDENT
// ==========================================================

async function updateStudent(
    form,
    photoFile
) {

    try {

        const studentId =
            editingStudentId;


        const updateData = {

            first_name:
                getFieldValue(
                    "firstName"
                ),

            middle_name:
                getFieldValue(
                    "middleName"
                ),

            last_name:
                getFieldValue(
                    "lastName"
                ),

            gender:
                getFieldValue(
                    "gender"
                ),

            date_of_birth:
                getFieldValue(
                    "dateOfBirth"
                ) || null,

            nationality:
                getFieldValue(
                    "nationality"
                ),

            country:
                getFieldValue(
                    "country"
                ),

            city:
                getFieldValue(
                    "city"
                ),

            phone:
                getFieldValue(
                    "phone"
                ),

            whatsapp:
                getFieldValue(
                    "whatsapp"
                ),

            email:
                getFieldValue(
                    "email"
                ),

            cohort:
                getFieldValue(
                    "cohort"
                ),

            chapter:
                getFieldValue(
                    "chapter"
                ),

            status:
                getFieldValue(
                    "status"
                ) || "Active",

            updated_at:
                new Date().toISOString()
        };


        // ------------------------------------------------------
        // Update photo if a new photo was selected
        // ------------------------------------------------------

        if (photoFile) {

            updateData.photo_url =
                await readPhoto(
                    photoFile
                );
        }


        const {
            data,
            error
        } = await supabaseClient
            .from("students")
            .update(updateData)
            .eq("id", studentId)
            .select()
            .single();


        if (error) {

            console.error(
                "Student update error:",
                error
            );


            alert(
                "Unable to update student.\n\n" +
                error.message
            );


            return;
        }


        console.log(
            "Student updated:",
            data
        );


        alert(
            "Student updated successfully!"
        );


        editingStudentId =
            null;


        form.reset();


        await refreshSystem();


    } catch (error) {

        console.error(
            "Update error:",
            error
        );


        alert(
            "An error occurred while updating the student."
        );
    }
}


// ==========================================================
// REFRESH SYSTEM
// ==========================================================

async function refreshSystem() {

    await loadStudentFilters();

    await renderStudentTable();

    await updateDashboardStats();

    await loadCohorts();
}


// ==========================================================
// RENDER STUDENT TABLE
// ==========================================================

async function renderStudentTable() {

    const table =
        document.getElementById(
            "studentTableBody"
        );


    if (!table) {
        return;
    }


    const students =
        await getStudents();


    const searchElement =
        document.getElementById(
            "studentSearch"
        );


    const cohortElement =
        document.getElementById(
            "cohortFilter"
        );


    const countryElement =
        document.getElementById(
            "countryFilter"
        );


    const genderElement =
        document.getElementById(
            "genderFilter"
        );


    const search =
        searchElement
            ? searchElement.value
                .toLowerCase()
                .trim()
            : "";


    const selectedCohort =
        cohortElement
            ? cohortElement.value
            : "";


    const selectedCountry =
        countryElement
            ? countryElement.value
            : "";


    const selectedGender =
        genderElement
            ? genderElement.value
            : "";


    const filtered =
        students.filter(
            function(student) {

                const text = (

                    (student.ayli_id || "") + " " +

                    (student.first_name || "") + " " +

                    (student.middle_name || "") + " " +

                    (student.last_name || "") + " " +

                    (student.gender || "") + " " +

                    (student.country || "") + " " +

                    (student.city || "") + " " +

                    (student.chapter || "") + " " +

                    (student.cohort || "") + " " +

                    (student.status || "") + " " +

                    (student.email || "") + " " +

                    (student.phone || "")

                ).toLowerCase();


                const searchMatch =
                    text.includes(search);


                const cohortMatch =
                    !selectedCohort ||
                    student.cohort ===
                    selectedCohort;


                const countryMatch =
                    !selectedCountry ||
                    String(
                        student.country || ""
                    ).toLowerCase() ===
                    selectedCountry.toLowerCase();


                const genderMatch =
                    !selectedGender ||
                    String(
                        student.gender || ""
                    ).toLowerCase() ===
                    selectedGender.toLowerCase();


                return (
                    searchMatch &&
                    cohortMatch &&
                    countryMatch &&
                    genderMatch
                );
            }
        );


    table.innerHTML = "";


    if (filtered.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    No students found.
                </td>
            </tr>
        `;

        return;
    }


    filtered.forEach(
        function(student) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${student.ayli_id || "-"}
                </td>

                <td>
                    ${student.first_name || ""}
                    ${student.middle_name || ""}
                    ${student.last_name || ""}
                </td>

                <td>
                    ${student.gender || "-"}
                </td>

                <td>
                    ${student.country || "-"}
                </td>

                <td>
                    ${student.cohort || "-"}
                </td>

                <td>
                    ${student.chapter || "-"}
                </td>

                <td>
                    ${student.status || "-"}
                </td>

                <td>

                    <a
                        href="student-profile.html?id=${encodeURIComponent(
                            student.ayli_id || ""
                        )}"
                    >
                        View Profile
                    </a>

                    <button
                        type="button"
                        onclick="editStudent(${student.id})"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onclick="setStudentPassword(${student.id})"
                    >
                        Password
                    </button>

                    <button
                        type="button"
                        onclick="deleteStudent(${student.id})"
                    >
                        Delete
                    </button>

                </td>
            `;


            table.appendChild(row);
        }
    );
}


// ==========================================================
// LOAD FILTERS
// ==========================================================

async function loadStudentFilters() {

    const students =
        await getStudents();


    // ======================================================
    // COHORT
    // ======================================================

    const cohortFilter =
        document.getElementById(
            "cohortFilter"
        );


    if (cohortFilter) {

        const current =
            cohortFilter.value;


        cohortFilter.innerHTML = `
            <option value="">
                All Cohorts
            </option>
        `;


        const cohorts =
            [
                ...new Set(
                    students
                        .map(
                            function(student) {
                                return student.cohort;
                            }
                        )
                        .filter(Boolean)
                )
            ];


        cohorts.sort();


        cohorts.forEach(
            function(cohort) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    cohort;


                option.textContent =
                    cohort;


                cohortFilter.appendChild(
                    option
                );
            }
        );


        if (
            cohorts.includes(current)
        ) {

            cohortFilter.value =
                current;
        }
    }


    // ======================================================
    // COUNTRY
    // ======================================================

    const countryFilter =
        document.getElementById(
            "countryFilter"
        );


    if (countryFilter) {

        const current =
            countryFilter.value;


        countryFilter.innerHTML = `
            <option value="">
                All Countries
            </option>
        `;


        const countries =
            [
                ...new Set(
                    students
                        .map(
                            function(student) {

                                return String(
                                    student.country || ""
                                ).trim();
                            }
                        )
                        .filter(Boolean)
                )
            ];


        countries.sort();


        countries.forEach(
            function(country) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    country;


                option.textContent =
                    country;


                countryFilter.appendChild(
                    option
                );
            }
        );


        if (
            countries.includes(current)
        ) {

            countryFilter.value =
                current;
        }
    }


    // ======================================================
    // GENDER
    // ======================================================

    const genderFilter =
        document.getElementById(
            "genderFilter"
        );


    if (genderFilter) {

        const current =
            genderFilter.value;


        genderFilter.innerHTML = `
            <option value="">
                All Genders
            </option>

            <option value="Male">
                Male
            </option>

            <option value="Female">
                Female
            </option>
        `;


        genderFilter.value =
            current;
    }
}


// ==========================================================
// EDIT STUDENT
// ==========================================================

async function editStudent(id) {

    const students =
        await getStudents();


    const student =
        students.find(
            function(item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );
            }
        );


    if (!student) {

        alert(
            "Student not found."
        );

        return;
    }


    editingStudentId =
        id;


    const fields = {

        firstName:
            student.first_name,

        middleName:
            student.middle_name,

        lastName:
            student.last_name,

        gender:
            student.gender,

        dateOfBirth:
            student.date_of_birth,

        nationality:
            student.nationality,

        country:
            student.country,

        city:
            student.city,

        phone:
            student.phone,

        whatsapp:
            student.whatsapp,

        email:
            student.email,

        cohort:
            student.cohort,

        chapter:
            student.chapter,

        status:
            student.status
    };


    Object.keys(fields).forEach(
        function(id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.value =
                    fields[id] || "";
            }
        }
    );


    const form =
        document.getElementById(
            "studentForm"
        );


    if (form) {

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ==========================================================
// SET STUDENT PASSWORD
// ==========================================================

async function setStudentPassword(id) {

    const password =
        prompt(
            "Enter a new password for this student:"
        );


    if (password === null) {
        return;
    }


    if (
        password.trim() === ""
    ) {

        alert(
            "Password cannot be empty."
        );

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("students")
        .update({
            password_hash:
                password.trim(),
            updated_at:
                new Date().toISOString()
        })
        .eq("id", id);


    if (error) {

        console.error(
            "Password update error:",
            error
        );


        alert(
            "Unable to update password.\n\n" +
            error.message
        );


        return;
    }


    alert(
        "Password successfully updated."
    );
}


// ==========================================================
// DELETE STUDENT
// ==========================================================

async function deleteStudent(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("students")
            .delete()
            .eq("id", id);


        if (error) {

            console.error(
                "Delete error:",
                error
            );


            alert(
                "Unable to delete student.\n\n" +
                error.message
            );


            return;
        }


        if (
            Number(editingStudentId) ===
            Number(id)
        ) {

            editingStudentId =
                null;


            const form =
                document.getElementById(
                    "studentForm"
                );


            if (form) {
                form.reset();
            }
        }


        await refreshSystem();


        alert(
            "Student deleted successfully!"
        );


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "An error occurred while deleting the student."
        );
    }
}


// ==========================================================
// DASHBOARD STATISTICS
// ==========================================================

async function updateDashboardStats() {

    const students =
        await getStudents();


    // ======================================================
    // TOTAL STUDENTS
    // ======================================================

    const totalStudents =
        document.getElementById(
            "totalStudents"
        );


    if (totalStudents) {

        totalStudents.textContent =
            students.length;
    }


    // ======================================================
    // MALE
    // ======================================================

    const maleStudents =
        document.getElementById(
            "maleStudents"
        );


    if (maleStudents) {

        const count =
            students.filter(
                function(student) {

                    return (
                        String(
                            student.gender || ""
                        ).toLowerCase() ===
                        "male"
                    );
                }
            ).length;


        maleStudents.textContent =
            count;
    }


    // ======================================================
    // FEMALE
    // ======================================================

    const femaleStudents =
        document.getElementById(
            "femaleStudents"
        );


    if (femaleStudents) {

        const count =
            students.filter(
                function(student) {

                    return (
                        String(
                            student.gender || ""
                        ).toLowerCase() ===
                        "female"
                    );
                }
            ).length;


        femaleStudents.textContent =
            count;
    }


    // ======================================================
    // GRADUATES
    // ======================================================

    const graduates =
        document.getElementById(
            "graduates"
        );


    if (graduates) {

        const count =
            students.filter(
                function(student) {

                    return (
                        String(
                            student.status || ""
                        ).toLowerCase() ===
                        "graduate"
                    );
                }
            ).length;


        graduates.textContent =
            count;
    }


    // ======================================================
    // TOTAL COHORTS
    // ======================================================

    const totalCohorts =
        document.getElementById(
            "totalCohorts"
        );


    if (totalCohorts) {

        const cohorts =
            [
                ...new Set(
                    students
                        .map(
                            function(student) {
                                return student.cohort;
                            }
                        )
                        .filter(Boolean)
                )
            ];


        totalCohorts.textContent =
            cohorts.length;
    }


    // ======================================================
    // TOTAL CHAPTERS
    // ======================================================

    const totalChapters =
        document.getElementById(
            "totalChapters"
        );


    if (totalChapters) {

        const chapters =
            [
                ...new Set(
                    students
                        .map(
                            function(student) {
                                return student.chapter;
                            }
                        )
                        .filter(Boolean)
                )
            ];


        totalChapters.textContent =
            chapters.length;
    }


    // ======================================================
    // TOTAL ALUMNI
    // ======================================================

    const totalAlumni =
        document.getElementById(
            "totalAlumni"
        );


    if (totalAlumni) {

        const count =
            students.filter(
                function(student) {

                    return (
                        String(
                            student.status || ""
                        ).toLowerCase() ===
                        "graduate"
                    );
                }
            ).length;


        totalAlumni.textContent =
            count;
    }


    // ======================================================
    // COUNTRY BREAKDOWN
    // ======================================================

    const countryBreakdown =
        document.getElementById(
            "countryBreakdown"
        );


    if (countryBreakdown) {

        const totals = {};


        students.forEach(
            function(student) {

                const country =
                    String(
                        student.country || ""
                    ).trim();


                if (!country) {
                    return;
                }


                if (!totals[country]) {
                    totals[country] = 0;
                }


                totals[country]++;
            }
        );


        const countries =
            Object.keys(totals);


        if (
            countries.length === 0
        ) {

            countryBreakdown.textContent =
                "No students registered yet.";

        } else {

            countryBreakdown.innerHTML =
                countries
                    .sort()
                    .map(
                        function(country) {

                            return `
                                <div>
                                    <strong>
                                        ${country}
                                    </strong>
                                    —
                                    ${totals[country]}
                                </div>
                            `;
                        }
                    )
                    .join("");
        }
    }
}


// ==========================================================
// COHORT MANAGEMENT
// ==========================================================

async function loadCohorts() {

    const table =
        document.getElementById(
            "cohortTableBody"
        );


    if (!table) {
        return;
    }


    const students =
        await getStudents();


    const cohortData = {};


    students.forEach(
        function(student) {

            const cohort =
                student.cohort;


            if (!cohort) {
                return;
            }


            if (!cohortData[cohort]) {
                cohortData[cohort] = 0;
            }


            cohortData[cohort]++;
        }
    );


    table.innerHTML =
        "";


    const cohorts =
        Object.keys(
            cohortData
        ).sort();


    if (
        cohorts.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center;">
                    No cohorts found.
                </td>
            </tr>
        `;

    } else {

        cohorts.forEach(
            function(cohort) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `
                    <td>
                        ${cohort}
                    </td>

                    <td>
                        ${cohortData[cohort]}
                    </td>

                    <td>
                        Active
                    </td>
                `;


                table.appendChild(
                    row
                );
            }
        );
    }


    const studentTotal =
        document.getElementById(
            "cohortStudentTotal"
        );


    if (studentTotal) {

        studentTotal.textContent =
            students.length;
    }


    const cohortTotal =
        document.getElementById(
            "cohortTotal"
        );


    if (cohortTotal) {

        cohortTotal.textContent =
            cohorts.length;
    }


    const activeCohorts =
        document.getElementById(
            "activeCohorts"
        );


    if (activeCohorts) {

        activeCohorts.textContent =
            cohorts.length;
    }
}


// ==========================================================
// INITIALIZE SYSTEM
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await loadStudentFilters();

        await renderStudentTable();

        await updateDashboardStats();

        await loadCohorts();


        // ======================================================
        // SEARCH
        // ======================================================

        const search =
            document.getElementById(
                "studentSearch"
            );


        if (search) {

            search.addEventListener(
                "input",
                function() {
                    renderStudentTable();
                }
            );
        }


        // ======================================================
        // COHORT FILTER
        // ======================================================

        const cohort =
            document.getElementById(
                "cohortFilter"
            );


        if (cohort) {

            cohort.addEventListener(
                "change",
                function() {
                    renderStudentTable();
                }
            );
        }


        // ======================================================
        // COUNTRY FILTER
        // ======================================================

        const country =
            document.getElementById(
                "countryFilter"
            );


        if (country) {

            country.addEventListener(
                "change",
                function() {
                    renderStudentTable();
                }
            );
        }


        // ======================================================
        // GENDER FILTER
        // ======================================================

        const gender =
            document.getElementById(
                "genderFilter"
            );


        if (gender) {

            gender.addEventListener(
                "change",
                function() {
                    renderStudentTable();
                }
            );
        }


        // ======================================================
        // CLEAR BUTTON
        // ======================================================

        const clearButton =
            document.getElementById(
                "clearStudentForm"
            );


        if (clearButton) {

            clearButton.addEventListener(
                "click",
                function() {

                    editingStudentId =
                        null;
                }
            );
        }


        console.log(
            "AYLI Student Management System connected to Supabase."
        );
    }
);