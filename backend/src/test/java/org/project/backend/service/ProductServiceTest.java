package org.project.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.project.backend.dto.products.ProductRequestDto;
import org.project.backend.dto.products.ProductResponseDto;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.ProductMapper;
import org.project.backend.model.Category;
import org.project.backend.model.Product;
import org.project.backend.repository.CategoryRepository;
import org.project.backend.repository.ProductRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests unitaires pour ProductService")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    private ProductRequestDto productRequest;
    private ProductResponseDto productResponse;
    private Product testProduct;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        // Setup test category
        testCategory = Category.builder()
                .idCategory(1)
                .nom("Croquettes")
                .dateCreation(java.time.LocalDateTime.now())
                .build();

        // Setup test product
        testProduct = Product.builder()
                .id(1)
                .nom("Croquettes Premium XL")
                .description("Nourriture de qualité premium")
                .prix(45.99f)
                .stock(100)
                .imageUrl("https://example.com/product1.jpg")
                .category(testCategory)
                .build();

        // Setup product request DTO
        productRequest = ProductRequestDto.builder()
                .nom("Croquettes Premium XL")
                .description("Nourriture de qualité premium")
                .prix(45.99f)
                .stock(100)
                .imageUrl("https://example.com/product1.jpg")
                .categoryId(1)
                .build();

        // Setup product response DTO
        productResponse = ProductResponseDto.builder()
                .id(1)
                .nom("Croquettes Premium XL")
                .description("Nourriture de qualité premium")
                .prix(45.99f)
                .stock(100)
                .imageUrl("https://example.com/product1.jpg")
                .categoryId(1)
                .categoryNom("Croquettes")
                .build();
    }

    // ───────────────────────────────────────────────────
    //  CREATE PRODUCT TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should create product successfully with valid data")
    void testCreateProductSuccess() {
        // Arrange
        when(productRepository.existsByNom(productRequest.getNom())).thenReturn(false);
        when(categoryRepository.findById(productRequest.getCategoryId()))
                .thenReturn(Optional.of(testCategory));
        when(productMapper.toEntity(productRequest, testCategory)).thenReturn(testProduct);
        when(productRepository.save(testProduct)).thenReturn(testProduct);
        when(productMapper.toResponseDto(testProduct)).thenReturn(productResponse);

        // Act
        ProductResponseDto response = productService.createProduct(productRequest);

        // Assert
        assertNotNull(response);
        assertEquals("Croquettes Premium XL", response.getNom());
        assertEquals(45.99f, response.getPrix());
        assertEquals(100, response.getStock());
        assertEquals(1, response.getCategoryId());

        verify(productRepository, times(1)).existsByNom(productRequest.getNom());
        verify(categoryRepository, times(1)).findById(productRequest.getCategoryId());
        verify(productMapper, times(1)).toEntity(productRequest, testCategory);
        verify(productRepository, times(1)).save(testProduct);
        verify(productMapper, times(1)).toResponseDto(testProduct);
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when product name already exists")
    void testCreateProductDuplicateName() {
        // Arrange
        when(productRepository.existsByNom(productRequest.getNom())).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateResourceException.class,
                () -> productService.createProduct(productRequest));

        verify(productRepository, times(1)).existsByNom(productRequest.getNom());
        verify(categoryRepository, never()).findById(any());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when category not found during creation")
    void testCreateProductCategoryNotFound() {
        // Arrange
        when(productRepository.existsByNom(productRequest.getNom())).thenReturn(false);
        when(categoryRepository.findById(productRequest.getCategoryId()))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> productService.createProduct(productRequest));

        verify(productRepository, times(1)).existsByNom(productRequest.getNom());
        verify(categoryRepository, times(1)).findById(productRequest.getCategoryId());
        verify(productRepository, never()).save(any());
    }

    // ───────────────────────────────────────────────────
    //  READ PRODUCT TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should retrieve product by ID successfully")
    void testGetProductByIdSuccess() {
        // Arrange
        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));
        when(productMapper.toResponseDto(testProduct)).thenReturn(productResponse);

        // Act
        ProductResponseDto response = productService.getProductById(1);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals("Croquettes Premium XL", response.getNom());
        assertEquals(45.99f, response.getPrix());

        verify(productRepository, times(1)).findById(1);
        verify(productMapper, times(1)).toResponseDto(testProduct);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product not found by ID")
    void testGetProductByIdNotFound() {
        // Arrange
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> productService.getProductById(999));

        verify(productRepository, times(1)).findById(999);
        verify(productMapper, never()).toResponseDto(any());
    }

    @Test
    @DisplayName("Should retrieve all products successfully")
    void testGetAllProductsSuccess() {
        // Arrange
        Product product2 = Product.builder()
                .id(2)
                .nom("Jouet pour chien")
                .description("Jouet résistant")
                .prix(15.99f)
                .stock(50)
                .imageUrl("https://example.com/product2.jpg")
                .category(testCategory)
                .build();

        ProductResponseDto response2 = ProductResponseDto.builder()
                .id(2)
                .nom("Jouet pour chien")
                .description("Jouet résistant")
                .prix(15.99f)
                .stock(50)
                .categoryId(1)
                .categoryNom("Croquettes")
                .build();

        List<Product> products = Arrays.asList(testProduct, product2);
        when(productRepository.findAll()).thenReturn(products);
        when(productMapper.toResponseDto(testProduct)).thenReturn(productResponse);
        when(productMapper.toResponseDto(product2)).thenReturn(response2);

        // Act
        List<ProductResponseDto> responses = productService.getAllProducts();

        // Assert
        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("Croquettes Premium XL", responses.get(0).getNom());
        assertEquals("Jouet pour chien", responses.get(1).getNom());

        verify(productRepository, times(1)).findAll();
        verify(productMapper, times(2)).toResponseDto(any());
    }

    @Test
    @DisplayName("Should return empty list when no products exist")
    void testGetAllProductsEmpty() {
        // Arrange
        when(productRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<ProductResponseDto> responses = productService.getAllProducts();

        // Assert
        assertNotNull(responses);
        assertEquals(0, responses.size());

        verify(productRepository, times(1)).findAll();
    }

    // ───────────────────────────────────────────────────
    //  UPDATE PRODUCT TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should update product successfully with valid data")
    void testUpdateProductSuccess() {
        // Arrange
        ProductRequestDto updateRequest = ProductRequestDto.builder()
                .nom("Croquettes Premium XL Updated")
                .description("Description mise à jour")
                .prix(50.99f)
                .stock(150)
                .imageUrl("https://example.com/product1-updated.jpg")
                .categoryId(1)
                .build();

        Product updatedProduct = Product.builder()
                .id(1)
                .nom("Croquettes Premium XL Updated")
                .description("Description mise à jour")
                .prix(50.99f)
                .stock(150)
                .imageUrl("https://example.com/product1-updated.jpg")
                .category(testCategory)
                .build();

        ProductResponseDto updatedResponse = ProductResponseDto.builder()
                .id(1)
                .nom("Croquettes Premium XL Updated")
                .description("Description mise à jour")
                .prix(50.99f)
                .stock(150)
                .imageUrl("https://example.com/product1-updated.jpg")
                .categoryId(1)
                .categoryNom("Croquettes")
                .build();

        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));
        when(productRepository.existsByNom(updateRequest.getNom())).thenReturn(false);
        when(categoryRepository.findById(updateRequest.getCategoryId()))
                .thenReturn(Optional.of(testCategory));
        doNothing().when(productMapper).updateEntityFromRequest(testProduct, updateRequest, testCategory);
        when(productRepository.save(testProduct)).thenReturn(updatedProduct);
        when(productMapper.toResponseDto(updatedProduct)).thenReturn(updatedResponse);

        // Act
        ProductResponseDto response = productService.updateProduct(1, updateRequest);

        // Assert
        assertNotNull(response);
        assertEquals("Croquettes Premium XL Updated", response.getNom());
        assertEquals(50.99f, response.getPrix());
        assertEquals(150, response.getStock());

        verify(productRepository, times(1)).findById(1);
        verify(productRepository, times(1)).existsByNom(updateRequest.getNom());
        verify(categoryRepository, times(1)).findById(updateRequest.getCategoryId());
        verify(productMapper, times(1)).updateEntityFromRequest(testProduct, updateRequest, testCategory);
        verify(productRepository, times(1)).save(testProduct);
        verify(productMapper, times(1)).toResponseDto(updatedProduct);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent product")
    void testUpdateProductNotFound() {
        // Arrange
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> productService.updateProduct(999, productRequest));

        verify(productRepository, times(1)).findById(999);
        verify(categoryRepository, never()).findById(any());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when updating with duplicate name")
    void testUpdateProductDuplicateName() {
        // Arrange
        ProductRequestDto updateRequest = ProductRequestDto.builder()
                .nom("Duplicate Name")
                .description("Description")
                .prix(50.99f)
                .stock(150)
                .imageUrl("https://example.com/product.jpg")
                .categoryId(1)
                .build();

        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));
        when(productRepository.existsByNom("Duplicate Name")).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateResourceException.class,
                () -> productService.updateProduct(1, updateRequest));

        verify(productRepository, times(1)).findById(1);
        verify(productRepository, times(1)).existsByNom("Duplicate Name");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when category not found during update")
    void testUpdateProductCategoryNotFound() {
        // Arrange
        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));
        when(categoryRepository.findById(productRequest.getCategoryId()))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> productService.updateProduct(1, productRequest));

        verify(productRepository, times(1)).findById(1);
        verify(categoryRepository, times(1)).findById(productRequest.getCategoryId());
    }

    // ───────────────────────────────────────────────────
    //  DELETE PRODUCT TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should delete product successfully")
    void testDeleteProductSuccess() {
        // Arrange
        when(productRepository.existsById(1)).thenReturn(true);
        doNothing().when(productRepository).deleteById(1);

        // Act
        productService.deleteProduct(1);

        // Assert
        verify(productRepository, times(1)).existsById(1);
        verify(productRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent product")
    void testDeleteProductNotFound() {
        // Arrange
        when(productRepository.existsById(999)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
                () -> productService.deleteProduct(999));

        verify(productRepository, times(1)).existsById(999);
        verify(productRepository, never()).deleteById(any());
    }

    // ───────────────────────────────────────────────────
    //  COUNT TESTS
    // ───────────────────────────────────────────────────

    @Test
    @DisplayName("Should return correct count of products")
    void testCountProductsSuccess() {
        // Arrange
        when(productRepository.count()).thenReturn(5L);

        // Act
        long count = productService.count();

        // Assert
        assertEquals(5L, count);
        verify(productRepository, times(1)).count();
    }

    @Test
    @DisplayName("Should return zero when no products exist")
    void testCountProductsEmpty() {
        // Arrange
        when(productRepository.count()).thenReturn(0L);

        // Act
        long count = productService.count();

        // Assert
        assertEquals(0L, count);
        verify(productRepository, times(1)).count();
    }
}




