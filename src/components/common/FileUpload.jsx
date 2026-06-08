import React from 'react'
import { Upload, Button, message } from 'antd'
import { UploadOutlined, PaperClipOutlined } from '@ant-design/icons'

export default function FileUpload({
  label = 'Upload File',
  accept = '.pdf,.jpg,.jpeg,.png',
  onUpload,
  maxSizeMB = 5,
  existingUrl,
}) {
  const beforeUpload = (file) => {
    const isValidSize = file.size / 1024 / 1024 < maxSizeMB
    if (!isValidSize) {
      message.error(`File must be smaller than ${maxSizeMB}MB`)
      return Upload.LIST_IGNORE
    }
    onUpload?.(file)
    return false // prevent auto upload
  }

  return (
    <div>
      {existingUrl && (
        <a
          href={existingUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 8,
            color: 'var(--color-brand)',
            fontSize: 13,
          }}
        >
          <PaperClipOutlined />
          View existing file
        </a>
      )}
      <Upload
        accept={accept}
        showUploadList={true}
        beforeUpload={beforeUpload}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />} style={{ fontFamily: 'var(--font-body)' }}>
          {label}
        </Button>
      </Upload>
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
        Accepts {accept} — max {maxSizeMB}MB
      </p>
    </div>
  )
}