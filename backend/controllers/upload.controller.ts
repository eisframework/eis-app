import { assets } from '../database/schema'
import db from '../database'
import { eq } from 'drizzle-orm'
import { transform } from 'bun-image-turbo'
import type { ControllerContext } from '../../types/controller.types'
import flash from '../services/flash.service'

// Storage Service Selection:
// To switch between S3 and Local Storage, change the import below:
//
// Local Storage:
import { getPublicUrl, uploadBuffer } from '../services/storage.service'
//
// S3 Storage:
// import { getPublicUrl, uploadBuffer } from '../services/s3.service'
//
// Both services have the same API, making it easy to switch between them.
// Local Storage is recommended for development, S3 for production.

// Mime type map for common image types
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.txt': 'text/plain',
  '.csv': 'text/csv'
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop() || ''
  return MIME_TYPES[`.${ext}`] || 'application/octet-stream'
}

export const uploadController = {
  /**
   * Upload Image with Processing
   * - Validates image type
   * - Processes with Sharp (resize, convert to WebP)
   * - Uploads to storage
   * - Saves metadata to database
   */
  async uploadImage(ctx: ControllerContext) {
    try {
      if (!ctx.user) {
        flash.set(ctx.set, 'error', 'Unauthorized')
        return Response.redirect('/login', 303)
      }

      const userId = ctx.user.id
      const formData = await ctx.request.formData()
      const file = formData.get('file') as File

      if (!file) {
        flash.set(ctx.set, 'error', 'No file provided')
        return Response.redirect('/upload', 303)
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        flash.set(ctx.set, 'error', `Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed. Got: ${file.type}`)
        return Response.redirect('/upload', 303)
      }

      const id = Bun.randomUUIDv7()
      const fileName = `${id}.webp`

      const buffer = await file.arrayBuffer()
      const processedBuffer = await transform(Buffer.from(buffer), {
        resize: { width: 1200, height: 1200, fit: 'inside' },
        output: { format: 'webp', webp: { quality: 80 } }
      })

      const storageKey = `assets/${fileName}`
      await uploadBuffer(storageKey, processedBuffer)
      const publicUrl = getPublicUrl(storageKey)

      const uploadedAsset = {
        id,
        type: 'image',
        url: publicUrl,
        mime_type: 'image/webp',
        name: fileName,
        size: processedBuffer.length,
        user_id: userId,
        storage_key: storageKey
      }

      await db.insert(assets).values(uploadedAsset)
      flash.set(ctx.set, 'success', 'Image uploaded successfully')
      ctx.set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/upload', 303)
    } catch (error: unknown) {
      console.error('Error uploading image:', error)
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Error uploading image')
      return Response.redirect('/upload', 303)
    }
  },

  /**
   * Upload File (Non-Image)
   * - Validates file type
   * - Uploads directly without processing
   * - Saves metadata to database
   */
  async uploadFile(ctx: ControllerContext) {
    try {
      if (!ctx.user) {
        flash.set(ctx.set, 'error', 'Unauthorized')
        return Response.redirect('/login', 303)
      }

      const userId = ctx.user.id
      const formData = await ctx.request.formData()
      const file = formData.get('file') as File

      if (!file) {
        flash.set(ctx.set, 'error', 'No file provided')
        return Response.redirect('/upload', 303)
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ]

      if (!allowedTypes.includes(file.type)) {
        flash.set(ctx.set, 'error', 'Invalid file type. Allowed types: PDF, Word, Excel, Text, CSV')
        return Response.redirect('/upload', 303)
      }

      const id = Bun.randomUUIDv7()
      const ext = file.name.split('.').pop() || 'bin'
      const fileName = `${id}.${ext}`

      const buffer = await file.arrayBuffer()
      const storageKey = `files/${userId}/${fileName}`
      await uploadBuffer(storageKey, Buffer.from(buffer))
      const publicUrl = getPublicUrl(storageKey)

      const uploadedAsset = {
        id,
        type: 'file',
        url: publicUrl,
        mime_type: file.type,
        name: file.name,
        size: buffer.byteLength,
        user_id: userId,
        storage_key: storageKey
      }

      await db.insert(assets).values(uploadedAsset)
      flash.set(ctx.set, 'success', 'File uploaded successfully')
      ctx.set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/upload', 303)
    } catch (error: unknown) {
      console.error('Error uploading file:', error)
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Error uploading file')
      return Response.redirect('/upload', 303)
    }
  },

  /**
   * Delete an uploaded asset
   */
  async delete(ctx: ControllerContext & { params: { id: string } }) {
    try {
      if (!ctx.user) {
        flash.set(ctx.set, 'error', 'Unauthorized')
        return Response.redirect('/login', 303)
      }

      const asset = await db.query.assets.findFirst({
        where: eq(assets.id, ctx.params.id)
      })

      if (!asset) {
        flash.set(ctx.set, 'error', 'Asset not found')
        return Response.redirect('/upload', 303)
      }

      if (asset.user_id !== ctx.user.id) {
        flash.set(ctx.set, 'error', 'You do not have permission to delete this asset')
        return Response.redirect('/upload', 303)
      }

      // TODO: Delete from storage
      // Need to add deleteObject function to storage service

      await db.delete(assets).where(eq(assets.id, ctx.params.id))
      flash.set(ctx.set, 'success', 'Asset deleted successfully')
      ctx.set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/upload', 303)
    } catch (error: unknown) {
      console.error('Error deleting asset:', error)
      flash.set(ctx.set, 'error', error instanceof Error ? error.message : 'Error deleting asset')
      return Response.redirect('/upload', 303)
    }
  }
}
