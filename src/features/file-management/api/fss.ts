"use client"

import { z } from "zod"
import { api } from "@/lib/api-client"
import { authStore } from "@/lib/auth-store"
import { env } from "@/lib/env"
import type { PageInfo } from "@/types/pagination"
import type {
  CompleteMultipartUploadArgs,
  CreateFileCatalogArgs,
  FileCatalog,
  FileCatalogTrees,
  FileRecord,
  InitMultipartUploadArgs,
  MultipartInitResp,
  QueryFileArgs,
} from "../types"

const CreateCatalogSchema = z.object({
  parentId: z.string().nullable(),
  name: z.string().min(1),
})

const RenameCatalogSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})

const InitMultipartUploadSchema = z.object({
  originalName: z.string().min(1),
  contentType: z.string().min(1),
  public: z.boolean(),
})

const BatchMoveSchema = z.object({
  catalogId: z.string().min(1),
  fileIds: z.array(z.string().min(1)).min(1),
})

const CompleteMultipartSchema = z.object({
  etags: z.array(
    z.object({
      partNumber: z.number().int().positive(),
      eTag: z.string().min(1),
    }),
  ),
})

const RenameFileSchema = z.object({
  id: z.string().min(1),
  filename: z.string().min(1),
})

const DEFAULT_BASE_PATH = "nexus-api/fss/tenant"

export function getDownloadUrl(bizType: string, id: string) {
  const token = authStore.getState().token ?? ""
  const tenantId = authStore.getState().tenantId ?? ""
  const encodedToken = encodeURIComponent(token)
  const baseUrl = import.meta.env.DEV ? "" : env.VITE_API_BASE_URL
  return `${baseUrl}/${DEFAULT_BASE_PATH}/files/${bizType}/${id}/download?Authorization=${encodedToken}&x-tenant-id=${tenantId}`
}

export function getViewUrl(bizType: string, id: string) {
  const token = authStore.getState().token ?? ""
  const tenantId = authStore.getState().tenantId ?? ""
  const encodedToken = encodeURIComponent(token)
  const baseUrl = import.meta.env.DEV ? "" : env.VITE_API_BASE_URL
  return `${baseUrl}/${DEFAULT_BASE_PATH}/files/${bizType}/${id}/view?Authorization=${encodedToken}&x-tenant-id=${tenantId}`
}

export async function fetchGetFileCatalogTrees(bizType: string) {
  return api
    .withTenantId()
    .get(`${DEFAULT_BASE_PATH}/catalogs/${bizType}/trees`)
    .json<FileCatalogTrees>()
}

export async function fetchCreateCatalog(bizType: string, args: CreateFileCatalogArgs) {
  const payload = CreateCatalogSchema.parse(args)
  return api
    .withTenantId()
    .post(`${DEFAULT_BASE_PATH}/catalogs/${bizType}`, { json: payload })
    .json<FileCatalog>()
}

export async function fetchRenameCatalog(bizType: string, id: string, name: string) {
  const payload = RenameCatalogSchema.parse({ id, name })
  return api
    .withTenantId()
    .patch(`${DEFAULT_BASE_PATH}/catalogs/${bizType}/${payload.id}/name`, {
      searchParams: { name: payload.name },
    })
    .json<FileCatalog>()
}

export async function fetchUpdateCatalogPublic(bizType: string, id: string, isPublic: boolean) {
  return api
    .withTenantId()
    .patch(`${DEFAULT_BASE_PATH}/catalogs/${bizType}/${id}/public`, {
      searchParams: { public: String(isPublic) },
    })
    .json<FileCatalog>()
}

export async function fetchChangeCatalogParent(
  bizType: string,
  id: string,
  parentId: string | null,
) {
  return api
    .withTenantId()
    .patch(`${DEFAULT_BASE_PATH}/catalogs/${bizType}/${id}/parent`, {
      searchParams: { parentId: parentId ?? "" },
    })
    .json()
}

export async function fetchCheckCatalogHasChildren(bizType: string, id: string) {
  return api
    .withTenantId()
    .get(`${DEFAULT_BASE_PATH}/catalogs/${bizType}/${id}/has-children`)
    .json<boolean>()
}

export async function fetchDeleteCatalog(bizType: string, id: string) {
  return api.withTenantId().delete(`${DEFAULT_BASE_PATH}/catalogs/${bizType}/${id}`).json()
}

export async function fetchForceDeleteCatalog(bizType: string, id: string) {
  return api.withTenantId().delete(`${DEFAULT_BASE_PATH}/catalogs/${bizType}/${id}/force`).json()
}

export async function fetchGetFileList(
  bizType: string,
  params: QueryFileArgs,
  page: number,
  size: number,
) {
  return api
    .withTenantId()
    .get(`${DEFAULT_BASE_PATH}/files/${bizType}`, {
      searchParams: {
        ...params,
        pageNumber: Math.max(1, page),
        pageSize: size,
      },
    })
    .json<PageInfo<FileRecord>>()
}

export async function fetchUploadFile(
  bizType: string,
  catalogId: string,
  file: File,
  signal?: AbortSignal,
) {
  const formData = new FormData()
  formData.append("file", file)
  return api
    .withTenantId()
    .put(`${DEFAULT_BASE_PATH}/files/${bizType}/${catalogId}`, {
      body: formData,
      signal: signal ?? null,
    })
    .json<FileRecord>()
}

export async function fetchInitMultipartUpload(
  bizType: string,
  catalogId: string,
  args: InitMultipartUploadArgs,
) {
  const payload = InitMultipartUploadSchema.parse(args)
  return api
    .withTenantId()
    .post(`${DEFAULT_BASE_PATH}/files/${bizType}/${catalogId}/multipart/init`, { json: payload })
    .json<MultipartInitResp>()
}

export async function fetchUploadPart(args: {
  uploadId: string
  partNumber: number
  data: Blob
  signal?: AbortSignal
}) {
  const { uploadId, partNumber, data, signal } = args
  return api
    .withTenantId()
    .put(`${DEFAULT_BASE_PATH}/files/multipart/${uploadId}/${partNumber}`, {
      body: data,
      signal: signal ?? null,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    })
    .json<{ partNumber: number; eTag: string }>()
}

export async function fetchCompleteMultipartUpload(
  bizType: string,
  catalogId: string,
  uploadId: string,
  args: CompleteMultipartUploadArgs,
) {
  const payload = CompleteMultipartSchema.parse(args)
  return api
    .withTenantId()
    .post(`${DEFAULT_BASE_PATH}/files/${bizType}/${catalogId}/multipart/${uploadId}/complete`, {
      json: payload,
    })
    .json<FileRecord>()
}

export async function fetchAbortMultipartUpload(uploadId: string) {
  return api.withTenantId().delete(`${DEFAULT_BASE_PATH}/files/multipart/${uploadId}`).json()
}

export async function fetchDeleteFile(bizType: string, id: string) {
  return api.withTenantId().delete(`${DEFAULT_BASE_PATH}/files/${bizType}/${id}`).json()
}

export async function fetchBatchDeleteFile(bizType: string, ids: string[]) {
  return api
    .withTenantId()
    .delete(`${DEFAULT_BASE_PATH}/files/${bizType}/batch`, { json: ids })
    .json()
}

export async function fetchRenameFile(bizType: string, id: string, filename: string) {
  const payload = RenameFileSchema.parse({ id, filename })
  const body = new URLSearchParams()
  body.set("filename", payload.filename)
  return api
    .withTenantId()
    .patch(`${DEFAULT_BASE_PATH}/files/${bizType}/${payload.id}/rename`, {
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .json()
}

export async function fetchBatchMoveFile(bizType: string, catalogId: string, fileIds: string[]) {
  const payload = BatchMoveSchema.parse({ catalogId, fileIds })
  return api
    .withTenantId()
    .post(`${DEFAULT_BASE_PATH}/files/${bizType}/move-batch`, { json: payload })
    .json()
}

export async function fetchDownloadFile(bizType: string, id: string) {
  return api.withTenantId().get(`${DEFAULT_BASE_PATH}/files/${bizType}/${id}/download`).blob()
}

export async function fetchGetRecycleBinFileList(
  bizType: string,
  params: QueryFileArgs,
  page: number,
  size: number,
) {
  return api
    .withTenantId()
    .get(`${DEFAULT_BASE_PATH}/files/${bizType}/recycle-bin`, {
      searchParams: {
        ...params,
        pageNumber: Math.max(1, page),
        pageSize: size,
      },
    })
    .json<PageInfo<FileRecord>>()
}

export async function fetchRecoveryCatalog(bizType: string, id: string) {
  return api.withTenantId().patch(`${DEFAULT_BASE_PATH}/catalogs/${bizType}/${id}/recovery`).json()
}

export async function fetchRecoveryFile(bizType: string, id: string) {
  return api.withTenantId().patch(`${DEFAULT_BASE_PATH}/files/${bizType}/${id}/recovery`).json()
}

export async function fetchBatchRecoveryFile(bizType: string, ids: string[]) {
  return api
    .withTenantId()
    .patch(`${DEFAULT_BASE_PATH}/files/${bizType}/batch/recovery`, { json: ids })
    .json()
}

export async function fetchHardDeleteCatalog(bizType: string, id: string) {
  return api.withTenantId().delete(`${DEFAULT_BASE_PATH}/catalogs/${bizType}/${id}/hard`).json()
}

export async function fetchHardDeleteFile(bizType: string, id: string) {
  return api.withTenantId().delete(`${DEFAULT_BASE_PATH}/files/${bizType}/${id}/hard`).json()
}

export async function fetchBatchHardDeleteFile(bizType: string, ids: string[]) {
  return api
    .withTenantId()
    .delete(`${DEFAULT_BASE_PATH}/files/${bizType}/batch/hard`, { json: ids })
    .json()
}

export async function fetchClearRecycleBin(bizType: string) {
  return api.withTenantId().delete(`${DEFAULT_BASE_PATH}/recycle-bin/${bizType}/clear`).json()
}
