from django import forms

from .models import Document, DocumentCategory, DocumentFolder


class DocumentAdminForm(forms.ModelForm):
    source_modified_at = forms.DateTimeField(required=False, widget=forms.HiddenInput())

    class Meta:
        model = Document
        fields = "__all__"


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
