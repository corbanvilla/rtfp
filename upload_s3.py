import boto3
from botocore.exceptions import NoCredentialsError

def upload_to_aws(local_file, bucket, s3_file):
    s3 = boto3.client('s3')

    try:
        s3.upload_file(local_file, bucket, s3_file, ExtraArgs={ "ContentType": "application/pdf", "ContentDisposition": "inline" })
        print("Upload Successful")
        return True
    except FileNotFoundError:
        print("The file was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False

if __name__ == "__main__":
    uploaded = upload_to_aws('./papers/Queering_Religion_Religious_Queers_----_(11_Islam_Homosexuality_and_Gay_Muslims_Bridging_the_Gap_between_Faith_...).pdf', 'rtfp-papers', 'Queering_Religion_Religious_Queers_----_(11_Islam_Homosexuality_and_Gay_Muslims_Bridging_the_Gap_between_Faith_...).pdf')
