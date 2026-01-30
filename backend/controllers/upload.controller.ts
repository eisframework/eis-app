import getDb from '../database'
import sharp from 'sharp'
import type { ControllerContext } from '../../types/controller.types'
import flash from '../services/flash.service'
import { getPublicUrl, uploadBuffer, deleteObject } from '../services/s3.service'
import { uuidv7 } from 'uuidv7'

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
  async uploadImage({ user, request, set }: ControllerContext) {
    try {
      if (!user) {
        flash.set(set, 'error', 'Unauthorized')
        return Response.redirect('/login', 303)
      }

      const userId = user.id
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        flash.set(set, 'error', 'No file provided')
        return Response.redirect('/upload', 303)
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        flash.set(set, 'error', `Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed. Got: ${file.type}`)
        return Response.redirect('/upload', 303)
      }

      const id = uuidv7()
      const fileName = `${id}.webp`

      const buffer = await file.arrayBuffer()
      const processedBuffer = await sharp(Buffer.from(buffer))
        .resize(1200, 1200, { fit: 'inside' })
        .webp({ quality: 80 })
        .toBuffer()

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

      await getDb()
        .insertInto('assets')
        .values(uploadedAsset)
        .execute()
      flash.set(set, 'success', 'Image uploaded successfully')
      set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/upload', 303)
    } catch (error: unknown) {
      console.error('Error uploading image:', error)
      flash.set(set, 'error', error instanceof Error ? error.message : 'Error uploading image')
      return Response.redirect('/upload', 303)
    }
  },

  /**
   * Upload File (Non-Image)
   * - Validates file type
   * - Uploads directly without processing
   * - Saves metadata to database
   */
  async uploadFile({ user, request, set }: ControllerContext) {
    try {
      if (!user) {
        flash.set(set, 'error', 'Unauthorized')
        return Response.redirect('/login', 303)
      }

      const userId = user.id
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        flash.set(set, 'error', 'No file provided')
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
        flash.set(set, 'error', 'Invalid file type. Allowed types: PDF, Word, Excel, Text, CSV')
        return Response.redirect('/upload', 303)
      }

      const id = uuidv7()
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

      await getDb()
        .insertInto('assets')
        .values(uploadedAsset)
        .execute()
      flash.set(set, 'success', 'File uploaded successfully')
      set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/upload', 303)
    } catch (error: unknown) {
      console.error('Error uploading file:', error)
      flash.set(set, 'error', error instanceof Error ? error.message : 'Error uploading file')
      return Response.redirect('/upload', 303)
    }
  },

  /**
   * Delete an uploaded asset
   */
  async delete({ user, params, set }: ControllerContext & { params: { id: string } }) {
    try {
      if (!user) {
        flash.set(set, 'error', 'Unauthorized')
        return Response.redirect('/login', 303)
      }

      const asset = await getDb()
        .selectFrom('assets')
        .selectAll()
        .where('assets.id', '=', params.id)
        .executeTakeFirst()

      if (!asset) {
        flash.set(set, 'error', 'Asset not found')
        return Response.redirect('/upload', 303)
      }

      if (asset.user_id !== user.id) {
        flash.set(set, 'error', 'You do not have permission to delete this asset')
        return Response.redirect('/upload', 303)
      }

      await deleteObject(asset.storage_key)
      await getDb()
        .deleteFrom('assets')
        .where('assets.id', '=', params.id)
        .execute()
      flash.set(set, 'success', 'Asset deleted successfully')
      set.headers['Content-Type'] = 'application/json'
      return Response.redirect('/upload', 303)
    } catch (error: unknown) {
      console.error('Error deleting asset:', error)
      flash.set(set, 'error', error instanceof Error ? error.message : 'Error deleting asset')
      return Response.redirect('/upload', 303)
    }
  }
}
