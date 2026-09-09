package com.collegelostandfound.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {

    /**
     * Validates and uploads an image to Cloudinary in the dedicated folder
     * "college-lost-and-found/lost-items".
     *
     * @param file the multipart image file to upload
     * @return the secure Cloudinary image URL
     */
    String uploadImage(MultipartFile file);
}
