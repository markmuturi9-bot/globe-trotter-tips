-- Create storage bucket for tip images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tip-images', 'tip-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tip images
CREATE POLICY "Anyone can view tip images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tip-images');

CREATE POLICY "Authenticated users can upload tip images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tip-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own tip images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'tip-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own tip images"
ON storage.objects FOR DELETE
USING (bucket_id = 'tip-images' AND auth.uid()::text = (storage.foldername(name))[1]);