import { StructureBuilder } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Admin Dashboard")
    .items([
      // Course Content
      S.listItem()
        .title("Course Content")
        .child(
          S.documentTypeList("course")
            .title("Courses")
            .child((courseId) =>
              S.list()
                .title("Course Options")
                .items([
                  // Option to edit course content
                  S.listItem()
                    .title("Edit Course Content")
                    .child(
                      S.document().schemaType("course").documentId(courseId)
                    ),
                  // Option to view course enrollments
                  S.listItem()
                    .title("View Students")
                    .child(
                      S.documentList()
                        .title("Course Enrollments")
                        .filter(
                          '_type == "enrollment" && course._ref == $courseId'
                        )
                        .params({ courseId })
                    ),
                ])
            )
        ),

      S.divider(),

      // MasterClass Management
      S.listItem()
        .title("MasterClass Management")
        .child(
          S.list()
            .title("MasterClass Options")
            .items([
              // All MasterClass Enrollments
              S.listItem()
                .title("All MasterClass Enrollments")
                .child(
                  S.documentTypeList("masterclassEnrollment")
                    .title("MasterClass Enrollments")
                    .defaultOrdering([
                      { field: "enrolledAt", direction: "desc" },
                    ])
                    .child((enrollmentId) =>
                      S.list()
                        .title("Enrollment Details")
                        .items([
                          // Edit enrollment
                          S.listItem()
                            .title("Edit Enrollment")
                            .child(
                              S.document()
                                .schemaType("masterclassEnrollment")
                                .documentId(enrollmentId)
                            ),
                          // View student details
                          S.listItem()
                            .title("View Student")
                            .child(
                              S.documentList()
                                .title("Student Details")
                                .filter(
                                  '_type == "student" && _id == $studentId'
                                )
                                .params({ studentId: "^.student._ref" })
                            ),
                        ])
                    )
                ),
              // Enrollments by Status
              S.listItem()
                .title("Enrollments by Status")
                .child(
                  S.list()
                    .title("Filter by Status")
                    .items([
                      S.listItem()
                        .title("Active Enrollments")
                        .child(
                          S.documentList()
                            .title("Active MasterClass Enrollments")
                            .schemaType("masterclassEnrollment")
                            .filter('_type == "masterclassEnrollment" && status == "active"')
                            .defaultOrdering([
                              { field: "enrolledAt", direction: "desc" },
                            ])
                        ),
                      S.listItem()
                        .title("Completed Sessions")
                        .child(
                          S.documentList()
                            .title("Completed MasterClass Enrollments")
                            .schemaType("masterclassEnrollment")
                            .filter('_type == "masterclassEnrollment" && status == "completed"')
                            .defaultOrdering([
                              { field: "enrolledAt", direction: "desc" },
                            ])
                        ),
                      S.listItem()
                        .title("Cancelled Enrollments")
                        .child(
                          S.documentList()
                            .title("Cancelled MasterClass Enrollments")
                            .schemaType("masterclassEnrollment")
                            .filter('_type == "masterclassEnrollment" && status == "cancelled"')
                            .defaultOrdering([
                              { field: "enrolledAt", direction: "desc" },
                            ])
                        ),
                    ])
                ),
              // Revenue Analytics
              S.listItem()
                .title("Revenue Analytics")
                .child(
                  S.list()
                    .title("Revenue Reports")
                    .items([
                      S.listItem()
                        .title("All Paid Enrollments")
                        .child(
                          S.documentList()
                            .title("Paid MasterClass Enrollments")
                            .schemaType("masterclassEnrollment")
                            .filter('_type == "masterclassEnrollment" && amount > 0')
                            .defaultOrdering([
                              { field: "enrolledAt", direction: "desc" },
                            ])
                        ),
                      S.listItem()
                        .title("KES Payments")
                        .child(
                          S.documentList()
                            .title("KES MasterClass Payments")
                            .schemaType("masterclassEnrollment")
                            .filter('_type == "masterclassEnrollment" && currency == "KES" && amount > 0')
                            .defaultOrdering([
                              { field: "enrolledAt", direction: "desc" },
                            ])
                        ),
                      S.listItem()
                        .title("USD Payments")
                        .child(
                          S.documentList()
                            .title("USD MasterClass Payments")
                            .schemaType("masterclassEnrollment")
                            .filter('_type == "masterclassEnrollment" && currency == "USD" && amount > 0')
                            .defaultOrdering([
                              { field: "enrolledAt", direction: "desc" },
                            ])
                        ),
                    ])
                ),
            ])
        ),

      S.divider(),

      // Users
      S.listItem()
        .title("User Management")
        .child(
          S.list()
            .title("Select a Type of User")
            .items([
              // Instructors with options
              S.listItem()
                .title("Instructors")
                .schemaType("instructor")
                .child(
                  S.documentTypeList("instructor")
                    .title("Instructors")
                    .child((instructorId) =>
                      S.list()
                        .title("Instructor Options")
                        .items([
                          // Option to edit instructor details
                          S.listItem()
                            .title("Edit Instructor Details")
                            .child(
                              S.document()
                                .schemaType("instructor")
                                .documentId(instructorId)
                            ),
                          // Option to view instructor's courses
                          S.listItem()
                            .title("View Courses")
                            .child(
                              S.documentList()
                                .title("Instructor's Courses")
                                .filter(
                                  '_type == "course" && instructor._ref == $instructorId'
                                )
                                .params({ instructorId })
                            ),
                        ])
                    )
                ),
              // Students with options
              S.listItem()
                .title("Students")
                .schemaType("student")
                .child(
                  S.documentTypeList("student")
                    .title("Students")
                    .child((studentId) =>
                      S.list()
                        .title("Student Options")
                        .items([
                          // Option to edit student details
                          S.listItem()
                            .title("Edit Student Details")
                            .child(
                              S.document()
                                .schemaType("student")
                                .documentId(studentId)
                            ),
                          // Option to view course enrollments
                          S.listItem()
                            .title("View Course Enrollments")
                            .child(
                              S.documentList()
                                .title("Student Course Enrollments")
                                .filter(
                                  '_type == "enrollment" && student._ref == $studentId'
                                )
                                .params({ studentId })
                            ),
                          // Option to view masterclass enrollments
                          S.listItem()
                            .title("View MasterClass Enrollments")
                            .child(
                              S.documentList()
                                .title("Student MasterClass Enrollments")
                                .filter(
                                  '_type == "masterclassEnrollment" && student._ref == $studentId'
                                )
                                .params({ studentId })
                                .defaultOrdering([
                                  { field: "enrolledAt", direction: "desc" },
                                ])
                            ),
                          // Option to view completed lessons
                          S.listItem()
                            .title("View Completed Lessons")
                            .child(
                              S.documentList()
                                .title("Completed Lessons")
                                .schemaType("lessonCompletion")
                                .filter(
                                  '_type == "lessonCompletion" && student._ref == $studentId'
                                )
                                .params({ studentId })
                                .defaultOrdering([
                                  { field: "completedAt", direction: "desc" },
                                ])
                            ),
                        ])
                    )
                ),
            ])
        ),

      S.divider(),

      // System Management
      S.listItem()
        .title("System Management")
        .child(
          S.list()
            .title("System Management")
            .items([
              S.documentTypeListItem("category").title("Categories"),

              S.divider(),

              // MasterClass Analytics
              S.listItem()
                .title("📊 MasterClass Analytics")
                .child(
                  S.documentTypeList("masterclassAnalytics")
                    .title("Analytics Reports")
                    .defaultOrdering([{ field: "reportDate", direction: "desc" }])
                ),

              // Performance Monitoring
              S.listItem()
                .title("📈 Performance Monitoring")
                .child(
                  S.documentTypeList("performanceMonitoring")
                    .title("Performance Reports")
                    .defaultOrdering([{ field: "timestamp", direction: "desc" }])
                ),

              // MasterClass Settings
              S.listItem()
                .title("⚙️ MasterClass Settings")
                .child(
                  S.documentTypeList("masterclassSettings")
                    .title("System Configuration")
                ),
            ])
        ),
    ]);
