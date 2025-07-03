package com.aprilboiz.jobmatch.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Base repository interface for entities that support soft delete functionality.
 * Provides methods to perform soft delete operations and query non-deleted entities.
 *
 * @param <T> Entity type that extends AuditableEntity
 * @param <ID> Primary key type
 */
@NoRepositoryBean
public interface SoftDeleteRepository<T, ID> extends JpaRepository<T, ID> {

    /**
     * Find entity by ID, excluding soft-deleted entities
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.id = :id AND e.deletedAt IS NULL")
    Optional<T> findByIdAndNotDeleted(@Param("id") ID id);

    /**
     * Find all non-deleted entities
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.deletedAt IS NULL")
    List<T> findAllNotDeleted();

    /**
     * Soft delete entity by ID
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.deletedAt = :deletedAt WHERE e.id = :id")
    void softDeleteById(@Param("id") ID id, @Param("deletedAt") LocalDateTime deletedAt);

    /**
     * Soft delete entity
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.deletedAt = :deletedAt WHERE e.id = :entityId")
    void softDelete(@Param("entityId") ID entityId, @Param("deletedAt") LocalDateTime deletedAt);

    /**
     * Restore soft-deleted entity by ID
     */
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.deletedAt = NULL WHERE e.id = :id")
    void restoreById(@Param("id") ID id);

    /**
     * Check if entity exists and is not deleted
     */
    @Query("SELECT COUNT(e) > 0 FROM #{#entityName} e WHERE e.id = :id AND e.deletedAt IS NULL")
    boolean existsByIdAndNotDeleted(@Param("id") ID id);

    /**
     * Find all deleted entities
     */
    @Query("SELECT e FROM #{#entityName} e WHERE e.deletedAt IS NOT NULL")
    List<T> findAllDeleted();
} 