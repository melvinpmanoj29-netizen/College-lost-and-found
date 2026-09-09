package com.collegelostandfound.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.collegelostandfound.backend.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    public static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024L; // 5 MB
    public static final String CLOUDINARY_FOLDER = "college-lost-and-found/lost-items";

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    public CloudinaryServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image file to upload");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only JPEG, PNG, and WEBP image formats are supported");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Image must be smaller than 5 MB");
        }

        if (cloudName == null || cloudName.isBlank()
                || apiKey == null || apiKey.isBlank()
                || apiSecret == null || apiSecret.isBlank()) {
            throw new IllegalStateException("Cloudinary is not configured on the server");
        }

        try {
            Map<String, Object> params = ObjectUtils.asMap(
                    "folder", CLOUDINARY_FOLDER,
                    "resource_type", "image",
                    "unique_filename", true,
                    "overwrite", false
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            String secureUrl = (String) uploadResult.get("secure_url");
            if (secureUrl == null || secureUrl.isBlank()) {
                throw new IllegalStateException("Failed to obtain secure image URL from Cloudinary");
            }
            return secureUrl;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to process image file for upload");
        } catch (Exception e) {
            throw new IllegalStateException("Image upload failed. Please try again.");
        }
    }
}
