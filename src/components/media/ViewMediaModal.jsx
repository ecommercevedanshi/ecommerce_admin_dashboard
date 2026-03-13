import { useGetMediaByEntityQuery } from "../../features/media/mediaApiSlice";

const ViewMediaModal = ({ entityId, close }) => {
  
  console.log(entityId)
  
  const { data, isLoading } = useGetMediaByEntityQuery(entityId, {
  skip: !entityId,
});

  if (isLoading) return null;

  const media = data?.data?.images || [];

  // console.log(data?.data?.images)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

      <div className="surface p-6 rounded-lg w-[700px]">

        <div className="flex justify-between mb-4">

          <h2 className="text-lg">Media Images</h2>

          <button
            className="btn-secondary"
            onClick={close}
          >
            Close
          </button>

        </div>

        <div className="grid grid-cols-4 gap-4">

          {media?.map((img) => (
            <div key={img._id}>

              <img
                src={img.url}
                alt={img.altText}
                className="w-full h-32 object-cover rounded"
              />

              {/* {img.isPrimary && (
                <div className="text-xs text-[var(--color-primary)] mt-1">
                  Primary
                </div>
              )} */}

            </div>
          ))}

        </div>

      </div>

    </div>
  );
};

export default ViewMediaModal;