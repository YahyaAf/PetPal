package org.project.backend.service;

import lombok.RequiredArgsConstructor;
import org.project.backend.dto.products.ProductRequestDto;
import org.project.backend.dto.products.ProductResponseDto;
import org.project.backend.exception.DuplicateResourceException;
import org.project.backend.exception.ResourceNotFoundException;
import org.project.backend.mapper.ProductMapper;
import org.project.backend.model.Category;
import org.project.backend.model.Product;
import org.project.backend.repository.CategoryRepository;
import org.project.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto requestDto) {
        if (productRepository.existsByNom(requestDto.getNom())) {
            throw new DuplicateResourceException("Product", "nom", requestDto.getNom());
        }

        Category category = categoryRepository.findById(requestDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", requestDto.getCategoryId()));

        Product product = productMapper.toEntity(requestDto, category);
        product = productRepository.save(product);
        return productMapper.toResponseDto(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toResponseDto(product);
    }

    @Transactional
    public ProductResponseDto updateProduct(Integer id, ProductRequestDto requestDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (!product.getNom().equals(requestDto.getNom()) &&
                productRepository.existsByNom(requestDto.getNom())) {
            throw new DuplicateResourceException("Product", "nom", requestDto.getNom());
        }

        Category category = categoryRepository.findById(requestDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", requestDto.getCategoryId()));

        productMapper.updateEntityFromRequest(product, requestDto, category);
        product = productRepository.save(product);
        return productMapper.toResponseDto(product);
    }

    @Transactional
    public void deleteProduct(Integer id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        productRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return productRepository.count();
    }
}

