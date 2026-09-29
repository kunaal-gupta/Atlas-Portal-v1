(function () {
  function initializeModifiedDateCapture() {
    const fileInput = document.getElementById('id_document_upload');
    const modifiedInput = document.getElementById('id_source_modified_at');
    if (!fileInput || !modifiedInput) return;

    fileInput.addEventListener('change', function () {
      const file = fileInput.files && fileInput.files[0];
      modifiedInput.value = file && file.lastModified ? new Date(file.lastModified).toISOString() : '';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModifiedDateCapture);
  } else {
    initializeModifiedDateCapture();
  }
})();
