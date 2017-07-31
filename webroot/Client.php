<?php
    $hostname = '192.168.0.11';
    $username = '';
    $password = '';
    try{
        //$dbh = new PDO('odbc:srvsage', $username, $password);
        $connection = odbc_connect("sage", 'sa', 'sage');
    }catch(PDOException $e){
        die($e);
    }
    //TOP 50
    $query = "SELECT CT_Num,CT_Adresse,CT_Complement,CT_CodePostal,CT_Ville,CT_Telephone,CT_Site FROM F_COMPTET WHERE CT_Num LIKE '%411%'";

    $result = odbc_exec($connection, $query);

    $hostname = 'localhost';
    $username = 'root';
    $password = '';
    try{
        $dbh = new PDO('mysql:host=localhost;dbname=osticket', $username, $password);
    }catch(PDOException $e){
        die($e);
    }

    while(odbc_fetch_row($result)){
        $date = date("Y-m-d H:i:s");

        $res = $dbh->prepare("INSERT IGNORE INTO ost_organization (name,manager,status,domain,extra,created,updated) VALUES (:name,'','0','',NULL,:created,:updated)");
        $res->execute(array(':name'=>odbc_result($result,1),':created'=>$date,':updated'=>$date));

        $orgID = $dbh->lastInsertId();
        if($orgID != 0){
            $address = odbc_result($result,2) . ' ' . odbc_result($result,3) . ' ' . odbc_result($result,4) . ' ' . odbc_result($result,5) . ' ';
            $phone = odbc_result($result,6);
            $website = odbc_result($result,7);

            $res = $dbh->prepare("INSERT INTO ost_form_entry (form_id,object_id,object_type,sort,extra,created,updated) VALUES ('4',:org_id,'O','1',NULL,:created,:updated)");
            $res->execute(array(':org_id'=>$orgID,':created'=>$date,':updated'=>$date));

            $entryID = $dbh->lastInsertId();

            $res = $dbh->prepare("INSERT INTO ost_form_entry_values (entry_id,field_id,value,value_id) VALUES (:entryID,'28',:address,NULL)");
            $res->execute(array(':entryID'=>$entryID,':address'=>$address));

            $res = $dbh->prepare("INSERT INTO ost_form_entry_values (entry_id,field_id,value,value_id) VALUES (:entryID,'29',:phone,NULL)");
            $res->execute(array(':entryID'=>$entryID,':phone'=>$phone));

            $res = $dbh->prepare("INSERT INTO ost_form_entry_values (entry_id,field_id,value,value_id) VALUES (:entryID,'30',:website,NULL)");
            $res->execute(array(':entryID'=>$entryID,':website'=>$website));
        }

    }

    //echo json_encode($array);
    odbc_close($connection)

?>
