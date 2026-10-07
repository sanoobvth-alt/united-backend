const spotlight = {
  title: "Spotlight Title",
  description: "Spotlight Description",
  status: "active", //enum: ["active", "inactive"]
};
const about = {
  title: "About Us",
  description: "About Us Description",
  image: "/assets/images/about/about-us.jpg",
  status: "active", //enum: ["active", "inactive"]
};
const course_category = {
  name: "Category Name",
  slug: "category-name",
  image: "/assets/images/category/category.jpg",
};
const blog_category = {
  name: "Category Name",
  slug: "category-name",
};
const testimonial = {
  student: student_id,
  description: "Testimonial Description",
};

const blog = {
  title: "Blog Title",
  slug: "",
  description: "Blog Description",
  image: "/assets/images/blog/blog.jpg",
  categories: category_id,
  tags: ["Tag1", "Tag2"],
  status: "draft", //enum: ["draft", "published", "archived"],
  content: "Blog content goes here...", //react-quill
};

const course = {
  title: "Course Title",
  slug: "course-slug",
  description: "Course Description",
  duration: "10 hours", //total of curriculum duration
  image: "/assets/images/course/course.jpg",
  status: "active", //enum: ["active", "inactive"]
  content: "Course content goes here...", //react-quill
  category: category_id,
  instructor: instructor_id,
  date_updated: "2024-10-01", //date of last update
  curriculum: [
    {
      title: "JavaScript Language Basics",
      lessons: [
        { title: "Let’s start coding!", duration: "04:40" },
        { title: "Variables and Data Types", duration: "04:20" },
        {
          title: "Ternary Operator and Switch Statements Preview",
          duration: "06:20",
        },
      ],
    },
  ],
  overview: [
    "Understand the fundamentals of healthy dieting",
    "Learn how to create balanced meal plans",
    "Discover the importance of portion control",
  ],
};

const review = {
  student: student_id,
  course: course_id,
  rating: 4, //1 to 5
  comment: "Review comment goes here...",
};

const user = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  passwordHash: "hashed_password_here",
  role: "student", //enum: ["student", "instructor", "admin"]
  isActive: true,
};

const students = {
  userId: user_id, //reference to user table for authentication
  phone: "123-456-7890",
  image: "/assets/images/students/profile.jpg",
  gender: "male", //enum: ["male", "female", "other"]
  dateOfBirth: "1995-12-31",
  createdAt: "2024-10-01T00:00:00Z",
};

const instructor = {
  userId: user_id, //reference to user table for authentication
  phone: "123-456-7890",
  image: "/assets/wp-content/uploads/2025/10/2-1.png",
  gender: "female", //enum: ["male", "female", "other"]'
  bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus interdum ligula non quam scelerisque hendrerit.",
  students: 2, //dynamic - calculated from courses entroll
  courses: 8, //dynamic - calculated from courses listed
  courseList: [course_id], //dynamic - list of courses taught by the instructor
};

const enrollment = {
  studentId: "student_id",
  courseId: "course_id",
  enrolledAt: "2024-10-01T00:00:00Z",
  status: "active", //enum: ["active", "completed", "cancelled"]
  progress: 0, // percentage
  completedAt: null,
};

const payment = {
  studentId: "student_id",
  courseId: "course_id",
  amount: 0,
  paymentMethod: "credit_card", //enum: ["credit_card", "paypal", "bank_transfer"]
  transactionId: "unique_transaction_id",
  status: "pending", //enum: ["pending", "success", "failed"]
  paidAt: null,
};
