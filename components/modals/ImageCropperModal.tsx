'use client';

import { useState, useCallback } from 'react';
import { Modal, Button, Group, Stack, Text } from '@mantine/core';
import Cropper, { Area } from 'react-easy-crop';
import { notifications } from '@mantine/notifications';

interface ImageCropperModalProps {
  opened: boolean;
  onClose: () => void;
  onImageCropped: (imageUrl: string) => void;
}

export function ImageCropperModal({
  opened,
  onClose,
  onImageCropped,
}: ImageCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas size to match cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Return as base64
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setLoading(true);

    try {
      // Get cropped image as base64
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Upload to server
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: croppedImage,
          filename: `meal-${Date.now()}.jpg`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onImageCropped(data.url);
        onClose();
        setImageSrc(null);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Crop Image"
      size="lg"
    >
      <Stack gap="md">
        {!imageSrc ? (
          <div>
            <Text size="sm" mb="sm">
              Select an image to crop (must be square 1:1 aspect ratio)
            </Text>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ width: '100%' }}
            />
          </div>
        ) : (
          <>
            <div style={{ position: 'relative', width: '100%', height: 400 }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div>
              <Text size="sm" mb="xs">
                Zoom
              </Text>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          {imageSrc && (
            <Button onClick={handleSave} loading={loading}>
              Upload
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
