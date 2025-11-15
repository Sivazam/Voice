#!/bin/bash

echo "🔍 MONITORING: Ready to detect document uploads..."
echo ""
echo "📋 What to watch for:"
echo "  1. POST /api/upload - File uploads to Firebase Storage"
echo "  2. POST /api/cases - Case submission with attachment data"
echo "  3. 📤 Uploading files - Progress tracking logs"
echo "  4. 📤 attachments - Attachment data in submission"
echo "  5. ✅ Upload successful - Successful file uploads"
echo ""
echo "🌐 Server: http://localhost:3000"
echo "📝 Monitoring file: /home/z/my-project/dev.log"
echo ""
echo "⏳ Waiting for user to test document upload..."

# Monitor for file upload activity
tail -f /home/z/my-project/dev.log | grep --line-buffered -E "(POST.*api/upload|POST.*api/cases|📤.*Uploading|📤.*attachments|✅.*Upload|❌.*Upload|📥.*attachments)" | while read line; do
    echo "🚨 DETECTED: $line"
    
    # Check for successful upload
    if echo "$line" | grep -q "POST.*api/upload.*200"; then
        echo "✅ FILE UPLOADED to Firebase Storage"
    fi
    
    # Check for case submission
    if echo "$line" | grep -q "POST.*api/cases.*200"; then
        echo "📄 CASE SUBMITTED to Firestore"
    fi
    
    # Check for attachment data
    if echo "$line" | grep -q "📤.*attachments.*\[\]"; then
        echo "📎 ATTACHMENTS DATA FOUND in submission"
    fi
    
    # Check for progress tracking
    if echo "$line" | grep -q "📤.*Uploading files"; then
        echo "📊 PROGRESS TRACKING ACTIVE"
    fi
    
    echo "---"
done