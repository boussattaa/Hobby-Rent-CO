-- Policy: Renters can view private details if they have an approved booking
CREATE POLICY "Renters can view private details for approved rentals"
ON item_private_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM rentals
    WHERE rentals.item_id = item_private_details.item_id
    AND rentals.renter_id = auth.uid()
    AND rentals.status IN ('approved', 'active')
  )
);
