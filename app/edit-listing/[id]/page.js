export default async function EditListingPage({ params }) {
    const { id } = await params;
    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1>Edit Listing {id}</h1>
            <p>Edit functionality coming shortly.</p>
        </div>
    );
}
