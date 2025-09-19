<?php

function create_contact_messages_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'bluestoneapp_contact_messages';
    
    // Check if table exists and if phone column exists
    $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table_name'") == $table_name;
    $phone_column_exists = false;
    
    if ($table_exists) {
        $columns = $wpdb->get_results("SHOW COLUMNS FROM $table_name");
        foreach ($columns as $column) {
            if ($column->Field === 'phone') {
                $phone_column_exists = true;
                break;
            }
        }
    }
    
    // If table doesn't exist or phone column is missing, (re)create the table
    if (!$table_exists || !$phone_column_exists) {
        // Drop the table if it exists
        $wpdb->query("DROP TABLE IF EXISTS $table_name");
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            email varchar(100) NOT NULL,
            phone varchar(20) DEFAULT NULL,
            subject varchar(200) NOT NULL,
            message text NOT NULL,
            date_submitted datetime NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'unread',
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Verify table was created and has phone column
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table_name'") == $table_name;
        if ($table_exists) {
            $columns = $wpdb->get_results("SHOW COLUMNS FROM $table_name");
            foreach ($columns as $column) {
                if ($column->Field === 'phone') {
                    return true;
                }
            }
        }
        return false;
    }
    
    return true;
}

function contact_us($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'bluestoneapp_contact_messages';

    // Ensure table exists with correct structure
    if (!create_contact_messages_table()) {
        return new WP_Error(
            'table_creation_failed',
            __('Could not create contact messages table', 'bluestoneapp-contact-us'),
            array('status' => 500)
        );
    }

    // Get parameters from request
    $params = $request->get_params();
    
    // Validate required fields
    $required_fields = ['name', 'email', 'subject', 'message'];
    foreach ($required_fields as $field) {
        if (empty($params[$field])) {
            return new WP_Error(
                'missing_field',
                sprintf(__('%s is required', 'bluestoneapp-contact-us'), ucfirst($field)),
                array('status' => 400)
            );
        }
    }

    // Validate email format
    if (!is_email($params['email'])) {
        return new WP_Error(
            'invalid_email',
            __('Invalid email address', 'bluestoneapp-contact-us'),
            array('status' => 400)
        );
    }

    // Prepare data for insertion
    $data = array(
        'name' => sanitize_text_field($params['name']),
        'email' => sanitize_email($params['email']),
        'phone' => isset($params['phone']) ? sanitize_text_field($params['phone']) : null,
        'subject' => sanitize_text_field($params['subject']),
        'message' => sanitize_textarea_field($params['message']),
        'date_submitted' => current_time('mysql'),
        'status' => 'unread'
    );

    // Insert into database
    $result = $wpdb->insert($table_name, $data);

    if ($result === false) {
        $last_error = $wpdb->last_error;
        return new WP_Error(
            'db_error',
            __('Failed to save contact message: ' . $last_error, 'bluestoneapp-contact-us'),
            array('status' => 500)
        );
    }

    // Send email notification if enabled
    $options = get_option('bluestoneapp_contact_options');
    if ($options && isset($options['enable_notifications']) && $options['enable_notifications']) {
        $to = isset($options['notification_email']) ? $options['notification_email'] : get_option('admin_email');
        $email_subject = isset($options['email_subject']) ? $options['email_subject'] : 'New Contact Form Submission: {subject}';
        $email_template = isset($options['email_template']) ? $options['email_template'] : 
            'Name: {name}<br/>Email: {email}<br/>Phone: {phone}<br/>Subject: {subject}<br/>Message: {message}';
        
        $subject = str_replace(
            array('{name}', '{email}', '{phone}', '{subject}'),
            array($data['name'], $data['email'], $data['phone'], $data['subject']),
            $email_subject
        );
        $message = str_replace(
            array('{name}', '{email}', '{phone}', '{subject}', '{message}'),
            array($data['name'], $data['email'], $data['phone'], $data['subject'], $data['message']),
            $email_template
        );
        $headers = array('Content-Type: text/html; charset=UTF-8');
        wp_mail($to, $subject, $message, $headers);
    }

    return array(
        'success' => true,
        'message' => __('Contact message sent successfully', 'bluestoneapp-contact-us'),
        'id' => $wpdb->insert_id
    );
}