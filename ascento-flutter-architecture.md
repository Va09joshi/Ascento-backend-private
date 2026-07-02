# Ascento Abacus - Flutter Integration & Architecture Guide

This document provides a production-ready architecture and integration guide for the Flutter mobile app to seamlessly connect with the Ascento Abacus Node.js backend. It focuses heavily on Super Admin CRUD Operations and Teacher/Student Management in a single app.

## 1. Production File Management (Feature-First Architecture)
Keep role-specific UI and logic strictly isolated in folders.

```text
lib/
├── core/
│   ├── api/
│   │   ├── api_client.dart       # Dio instance & interceptors
│   │   ├── api_constants.dart    # Endpoints
│   ├── local_storage/
│   └── routes/
│       └── app_router.dart       # RBAC Navigation Logic
├── features/
│   ├── auth/                     
│   ├── admin/                    # ADMIN DASHBOARD & CRUD
│   │   ├── dashboard/            
│   │   ├── branches_crud/        
│   │   ├── academic_crud/        
│   │   ├── users/                # Manage Students & Teachers
│   │   └── content_upload/       
│   ├── teacher/                  # TEACHER
│   │   ├── attendance/           
│   │   └── timetable/
│   └── student/                  # STUDENT
│       ├── exams/
│       └── courses/
└── main.dart
```

## 2. API Constants & Configuration
`lib/core/api/api_constants.dart`

```dart
class ApiConstants {
  static const String baseUrl = 'http://10.0.2.2:3000/api/v1'; 
  // Admin CRUD Operations
  static const String branches = '/branches';
  static const String classes = '/classes';
  static const String manageUsers = '/admin/users';
  
  // Content & Uploads
  static const String content = '/content';
}
```

## 3. Admin: Full CRUD Management
Admins have full global access to Create, Read, Update, and Delete (CRUD) operations on core entities like Branches, Classes, and Staff (Teachers/Admins).

Example: Branch Management Repository
`lib/features/admin/branches_crud/branch_repository.dart`

```dart
class BranchRepository {
  final ApiClient apiClient;
  BranchRepository(this.apiClient);
  // READ (List all branches)
  Future<List<dynamic>> getBranches() async {
    final response = await apiClient.dio.get(ApiConstants.branches);
    return response.data['data'];
  }
  // CREATE
  Future<void> createBranch({required String name, required String city}) async {
    await apiClient.post(ApiConstants.branches, data: {
      'name': name,
      'city': city,
    });
  }
  // UPDATE
  Future<void> updateBranch(String id, Map<String, dynamic> data) async {
    await apiClient.dio.patch('${ApiConstants.branches}/$id', data: data);
  }
  // DELETE (Soft Delete)
  Future<void> deleteBranch(String id) async {
    await apiClient.dio.delete('${ApiConstants.branches}/$id');
  }
}
```

## 4. Admin: Teacher Management
Just like managing Students, Admins have full access to manage Teachers.

`lib/features/admin/users/teacher_repository.dart`

```dart
class TeacherRepository {
  final ApiClient apiClient;
  TeacherRepository(this.apiClient);
  // READ: List all teachers (Optionally filter by branch)
  Future<List<dynamic>> getTeachers({String? branchId}) async {
    final response = await apiClient.dio.get(
      ApiConstants.manageUsers,
      queryParameters: {
        'role': 'teacher',
        if (branchId != null) 'branch_id': branchId,
      },
    );
    return response.data['data'];
  }
  // CREATE: Onboard a new Teacher
  Future<void> createTeacher({
    required String fullName,
    required String email,
    required String phone,
    required String branchId,
  }) async {
    await apiClient.post(ApiConstants.manageUsers, data: {
      'role': 'teacher',
      'full_name': fullName,
      'email': email,
      'phone': phone,
      'branch_id': branchId,
    });
    // Note: The backend automatically generates a secure password and emails it to the teacher.
  }
  
  // UPDATE: Deactivate a Teacher
  Future<void> deactivateTeacher(String teacherId) async {
    await apiClient.dio.delete('${ApiConstants.manageUsers}/$teacherId');
  }
}
```

## 5. File Uploads (PDFs & Videos)
`lib/features/admin/content_upload/content_repository.dart`

```dart
import 'package:dio/dio.dart';
import 'dart:io';
class ContentRepository {
  final ApiClient apiClient;
  ContentRepository(this.apiClient);
  Future<void> uploadMaterial({
    required File file,
    required String title,
    required String type, // 'video' or 'pdf'
    required String courseId,
  }) async {
    String fileName = file.path.split('/').last;
    
    FormData formData = FormData.fromMap({
      'title': title,
      'type': type,
      'course_id': courseId,
      'file': await MultipartFile.fromFile(file.path, filename: fileName),
    });
    try {
      await apiClient.dio.post(
        ApiConstants.content,
        data: formData,
        options: Options(headers: {'Content-Type': 'multipart/form-data'}),
      );
    } on DioException catch (e) {
      throw Exception('Upload Failed: ${e.response?.data['error']['message']}');
    }
  }
}
```

## 6. Single App Routing Logic (RBAC)
`lib/core/routes/app_router.dart`

```dart
void _navigateBasedOnRole(String role) {
  switch (role) {
    case 'super_admin':
    case 'admin':
      router.pushReplacement('/admin-dashboard'); // Both use the same dashboard UI!
      break;
    case 'teacher':
      router.pushReplacement('/teacher-dashboard'); // View Timetable, Mark Attendance
      break;
    case 'student':
      router.pushReplacement('/student-dashboard'); // View Courses, Exams, AI Reports
      break;
    default:
      router.pushReplacement('/login');
  }
}
```
