package com.collegelostandfound.backend.dto.response;

import com.collegelostandfound.backend.entity.User;

/**
 * User profile response. Never includes the password hash.
 */
public class UserResponse {

    private Long id;
    private String studentName;
    private String rollNumber;
    private String className;
    private String email;
    private String profileImageUrl;
    private String role;

    public UserResponse() {
    }

    public static UserResponse from(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setStudentName(user.getStudentName());
        response.setRollNumber(user.getRollNumber());
        response.setClassName(user.getClassName());
        response.setEmail(user.getEmail());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setRole(user.getRole());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}