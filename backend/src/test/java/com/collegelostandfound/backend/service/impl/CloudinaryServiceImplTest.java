package com.collegelostandfound.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloudinaryServiceImplTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    private CloudinaryServiceImpl cloudinaryService;

    @BeforeEach
    void setUp() {
        cloudinaryService = new CloudinaryServiceImpl(cloudinary);
        ReflectionTestUtils.setField(cloudinaryService, "cloudName", "test-cloud");
        ReflectionTestUtils.setField(cloudinaryService, "apiKey", "test-key");
        ReflectionTestUtils.setField(cloudinaryService, "apiSecret", "test-secret");
    }

    @Test
    void uploadImage_nullOrEmptyFile_throwsIllegalArgumentException() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[0]);

        IllegalArgumentException ex1 = assertThrows(IllegalArgumentException.class, () ->
                cloudinaryService.uploadImage(null));
        assertTrue(ex1.getMessage().contains("Please select an image file"));

        IllegalArgumentException ex2 = assertThrows(IllegalArgumentException.class, () ->
                cloudinaryService.uploadImage(emptyFile));
        assertTrue(ex2.getMessage().contains("Please select an image file"));
    }

    @Test
    void uploadImage_unsupportedContentType_throwsIllegalArgumentException() {
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "dummy content".getBytes()
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                cloudinaryService.uploadImage(pdfFile));
        assertTrue(ex.getMessage().contains("Only JPEG, PNG, and WEBP"));
    }

    @Test
    void uploadImage_oversizedFile_throwsIllegalArgumentException() {
        byte[] oversizedBytes = new byte[(int) (CloudinaryServiceImpl.MAX_FILE_SIZE_BYTES + 10)];
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.png",
                "image/png",
                oversizedBytes
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                cloudinaryService.uploadImage(largeFile));
        assertTrue(ex.getMessage().contains("Image must be smaller than 5 MB"));
    }

    @Test
    void uploadImage_missingCredentials_throwsIllegalStateException() {
        ReflectionTestUtils.setField(cloudinaryService, "cloudName", "");

        MockMultipartFile validFile = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "valid-image-bytes".getBytes()
        );

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                cloudinaryService.uploadImage(validFile));
        assertTrue(ex.getMessage().contains("Cloudinary is not configured on the server"));
    }

    @Test
    void uploadImage_validImage_returnsSecureUrl() throws Exception {
        MockMultipartFile validFile = new MockMultipartFile(
                "file",
                "photo.jpg",
                "image/jpeg",
                "image-bytes-here".getBytes()
        );

        String expectedUrl = "https://res.cloudinary.com/test-cloud/image/upload/v12345/college-lost-and-found/lost-items/photo.jpg";
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(eq("image-bytes-here".getBytes()), any(Map.class)))
                .thenReturn(Map.of("secure_url", expectedUrl));

        String resultUrl = cloudinaryService.uploadImage(validFile);
        assertEquals(expectedUrl, resultUrl);
    }

    @Test
    void uploadImage_cloudinaryFails_throwsCleanErrorMessageWithoutSecrets() throws Exception {
        MockMultipartFile validFile = new MockMultipartFile(
                "file",
                "photo.jpg",
                "image/jpeg",
                "image-bytes-here".getBytes()
        );

        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), any(Map.class)))
                .thenThrow(new RuntimeException("Cloudinary API server error with internal key 123456789"));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                cloudinaryService.uploadImage(validFile));
        assertEquals("Image upload failed. Please try again.", ex.getMessage());
        assertFalse(ex.getMessage().contains("123456789"));
    }
}
