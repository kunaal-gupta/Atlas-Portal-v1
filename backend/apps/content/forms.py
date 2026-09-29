from django import forms

from .models import DocumentCategory, DocumentFolder


class FolderImportForm(forms.Form):
    parent = forms.ModelChoiceField(
        queryset=DocumentFolder.objects.all(),
        required=False,
        help_text="Leave blank to import at the top level.",
    )
    categories = forms.ModelMultipleChoiceField(
        queryset=DocumentCategory.objects.all(),
        help_text="Every imported file will appear on these portal pages.",
    )
